import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/adminSession';
import { getAuthProfileId } from '@/lib/authSession';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const VIDEO_BUCKET = 'anxiety-video-stories';
const GUEST_OWNER_COOKIE = 'anxiety_video_owner';
const MAX_VIDEO_BYTES = 30 * 1024 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_TYPES: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov'
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isMissingStoriesTable(error: { code?: string } | null) {
  return error?.code === '42P01' || error?.code === 'PGRST205';
}

function missingStoriesTableResponse() {
  return NextResponse.json(
    { error: 'Video Stories database setup is incomplete. Apply the anxiety video stories migration in Supabase, then try again.' },
    { status: 503 }
  );
}

function signGuestOwnerId(ownerId: string) {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    throw new Error('Missing env: SUPABASE_SECRET_KEY');
  }
  return createHmac('sha256', secret).update(ownerId).digest('base64url');
}

function getGuestOwnerId(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookie = cookieHeader
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${GUEST_OWNER_COOKIE}=`));
  const token = cookie?.slice(GUEST_OWNER_COOKIE.length + 1);
  if (!token) return null;

  const [ownerId, providedSignature] = token.split('.');
  if (!ownerId || !providedSignature || !UUID_PATTERN.test(ownerId)) return null;

  try {
    const expected = Buffer.from(signGuestOwnerId(ownerId));
    const provided = Buffer.from(providedSignature);
    if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
    return ownerId;
  } catch (error) {
    console.error('Unable to verify guest video-story session:', error);
    return null;
  }
}

function getVideoStoryOwnerId(request: Request) {
  return getAuthProfileId(request) || getGuestOwnerId(request);
}

export async function GET(request: Request) {
  try {
    const isAdmin = await hasAdminSession(request).catch(() => false);
    const ownerId = getVideoStoryOwnerId(request);
    const requestUrl = new URL(request.url);
    const isLibraryRequest = requestUrl.searchParams.get('view') === 'library';
    const requestedPage = Number.parseInt(requestUrl.searchParams.get('page') ?? '0', 10);
    const pageNumber = Number.isSafeInteger(requestedPage) ? Math.min(Math.max(requestedPage, 0), 10000) : 0;
    const pageSize = 24;
    let hasMore = false;

    let stories;
    if (isAdmin && !isLibraryRequest) {
      const { data: pendingStories, error: pendingError } = await supabaseAdmin
        .from('anxiety_video_stories')
        .select('id,user_id,user_name,caption,storage_path,status,created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(100);

      if (pendingError) {
        console.error('Unable to load pending Anxiety video stories:', pendingError);
        if (isMissingStoriesTable(pendingError)) {
          return missingStoriesTableResponse();
        }
        return NextResponse.json({ error: 'Video stories could not be loaded.' }, { status: 500 });
      }

      const { data: reviewedStories, error: reviewedError } = await supabaseAdmin
        .from('anxiety_video_stories')
        .select('id,user_id,user_name,caption,storage_path,status,created_at')
        .neq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50);

      if (reviewedError) {
        console.error('Unable to load reviewed Anxiety video stories:', reviewedError);
        if (isMissingStoriesTable(reviewedError)) {
          return missingStoriesTableResponse();
        }
        return NextResponse.json({ error: 'Video stories could not be loaded.' }, { status: 500 });
      }

      stories = [...(pendingStories ?? []), ...(reviewedStories ?? [])];
    } else {
      const approvedQuery = supabaseAdmin
        .from('anxiety_video_stories')
        .select('id,user_id,user_name,caption,storage_path,status,created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      const approvedResult = isLibraryRequest
        ? await approvedQuery.range(pageNumber * pageSize, pageNumber * pageSize + pageSize)
        : await approvedQuery.limit(ownerId ? 10 : 12);
      const { data: approvedData, error: approvedError } = approvedResult;

      if (approvedError) {
        console.error('Unable to load approved Anxiety video stories:', approvedError);
        if (isMissingStoriesTable(approvedError)) {
          return missingStoriesTableResponse();
        }
        return NextResponse.json({ error: 'Video stories could not be loaded.' }, { status: 500 });
      }

      const approvedStories = isLibraryRequest
        ? (approvedData ?? []).slice(0, pageSize)
        : approvedData;
      hasMore = isLibraryRequest && (approvedData?.length ?? 0) > pageSize;

      let pendingStories: typeof approvedStories = [];
      if (ownerId && !isLibraryRequest) {
        const { data, error } = await supabaseAdmin
          .from('anxiety_video_stories')
          .select('id,user_id,user_name,caption,storage_path,status,created_at')
          .eq('user_id', ownerId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(2);

        if (error) {
          console.error('Unable to load the current user’s pending Anxiety video stories:', error);
          if (isMissingStoriesTable(error)) {
            return missingStoriesTableResponse();
          }
          return NextResponse.json({ error: 'Your pending video stories could not be loaded.' }, { status: 500 });
        }
        pendingStories = data ?? [];
      }

      stories = [...pendingStories, ...(approvedStories ?? [])];
    }

    const storyList = await Promise.all(
      stories.map(async (story) => {
        const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
          .from(VIDEO_BUCKET)
          .createSignedUrl(story.storage_path, 60 * 60);

        if (signedUrlError || !signedUrlData?.signedUrl) {
          return null;
        }

        return {
          id: story.id,
          user_id: story.user_id,
          user_name: story.user_name,
          caption: story.caption,
          storage_path: story.storage_path,
          status: story.status,
          created_at: story.created_at,
          video_url: signedUrlData.signedUrl
        };
      })
    );

    return NextResponse.json(
      {
        stories: storyList.filter(Boolean),
        ...(isLibraryRequest ? { page: pageNumber, pageSize, hasMore } : {})
      },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    console.error('Anxiety video stories GET failed:', error);
    return NextResponse.json({ error: 'Video stories could not be loaded.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (body.action === 'prepare-upload') {
    const fileType = typeof body.fileType === 'string' ? body.fileType : '';
    const fileSize = typeof body.fileSize === 'number' ? body.fileSize : NaN;
    const extension = ALLOWED_TYPES[fileType];

    if (!extension || !Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_VIDEO_BYTES) {
      return NextResponse.json({ error: 'Choose a valid MP4, WebM, or MOV video under 30 MB.' }, { status: 400 });
    }

    const path = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { data, error } = await supabaseAdmin.storage.from(VIDEO_BUCKET).createSignedUploadUrl(path);

    if (error || !data) {
      console.error('Unable to prepare video upload URL:', error);
      return NextResponse.json({ error: 'Video upload is unavailable right now.' }, { status: 500 });
    }

    const authenticatedOwnerId = getAuthProfileId(request);
    const existingGuestOwnerId = authenticatedOwnerId ? null : getGuestOwnerId(request);
    const ownerId = authenticatedOwnerId || existingGuestOwnerId || crypto.randomUUID();
    const response = NextResponse.json({ path, token: data.token, ownerId });

    if (!authenticatedOwnerId && !existingGuestOwnerId) {
      const signature = signGuestOwnerId(ownerId);
      response.cookies.set(GUEST_OWNER_COOKIE, `${ownerId}.${signature}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 30
      });
    }

    return response;
  }

  if (body.action !== 'submit') {
    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  }

  const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
  const userName = typeof body.userName === 'string' ? body.userName.trim() : '';
  const caption = typeof body.caption === 'string' ? body.caption.trim() : '';
  const storagePath = typeof body.path === 'string' ? body.path.trim() : '';

  if (!userId || !userName || !caption || !storagePath) {
    return NextResponse.json({ error: 'Please complete the caption and upload a video.' }, { status: 400 });
  }

  const ownerId = getVideoStoryOwnerId(request);
  if (!ownerId || ownerId !== userId) {
    return NextResponse.json({ error: 'Your video-sharing session expired. Please try posting again.' }, { status: 401 });
  }

  if (caption.length > 240 || userName.length > 64 || userId.length > 128) {
    return NextResponse.json({ error: 'Your caption or name is too long.' }, { status: 400 });
  }

  if (!/^\d+-[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(mp4|webm|mov)$/i.test(storagePath)) {
    return NextResponse.json({ error: 'The uploaded video reference is invalid. Please choose the video again.' }, { status: 400 });
  }

  const { data: uploadedVideo, error: uploadedVideoError } = await supabaseAdmin.storage
    .from(VIDEO_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);
  if (uploadedVideoError || !uploadedVideo) {
    return NextResponse.json({ error: 'The uploaded video could not be found. Please select it again.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('anxiety_video_stories')
    .insert({
      user_id: userId,
      user_name: userName,
      caption,
      storage_path: storagePath,
      status: 'pending'
    })
    .select('id,status')
    .single();

  if (error || !data) {
    console.error('Unable to save Anxiety video story:', error);
    const { error: cleanupError } = await supabaseAdmin.storage.from(VIDEO_BUCKET).remove([storagePath]);
    if (cleanupError) {
      console.error('Unable to clean up an unsaved Anxiety video story:', cleanupError);
    }
    if (isMissingStoriesTable(error)) {
      return missingStoriesTableResponse();
    }
    return NextResponse.json({ error: 'Your video uploaded, but the story could not be saved.' }, { status: 500 });
  }

  return NextResponse.json({
    story: { ...data, video_url: uploadedVideo.signedUrl }
  }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await hasAdminSession(request).catch(() => false))) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!isRecord(body) || typeof body.id !== 'string' || (body.status !== 'approved' && body.status !== 'rejected')) {
    return NextResponse.json({ error: 'Invalid moderation request.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('anxiety_video_stories')
    .update({ status: body.status, reviewed_at: new Date().toISOString() })
    .eq('id', body.id)
    .select('id,status')
    .maybeSingle();

  if (error) {
    console.error('Unable to moderate Anxiety video story:', error);
    return NextResponse.json({ error: 'The story could not be moderated.' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Video story not found.' }, { status: 404 });
  }

  return NextResponse.json({ story: data });
}

export async function DELETE(request: Request) {
  if (!(await hasAdminSession(request).catch(() => false))) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!isRecord(body) || typeof body.id !== 'string') {
    return NextResponse.json({ error: 'Invalid story ID.' }, { status: 400 });
  }

  const { data: story, error: findError } = await supabaseAdmin
    .from('anxiety_video_stories')
    .select('id,storage_path')
    .eq('id', body.id)
    .maybeSingle();

  if (findError) {
    console.error('Unable to find story to remove:', findError);
    return NextResponse.json({ error: 'The story could not be removed.' }, { status: 500 });
  }

  if (!story) {
    return NextResponse.json({ error: 'Story not found.' }, { status: 404 });
  }

  const { error: storageError } = await supabaseAdmin.storage.from(VIDEO_BUCKET).remove([story.storage_path]);
  if (storageError) {
    console.error('Unable to remove video file from storage:', storageError);
  }

  const { error } = await supabaseAdmin.from('anxiety_video_stories').delete().eq('id', story.id);
  if (error) {
    console.error('Unable to remove story record:', error);
    return NextResponse.json({ error: 'The story record could not be removed.' }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
