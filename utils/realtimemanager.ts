// utils/realtimeManager.ts - Professional real-time handler
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

export interface RealtimeConfig {
  roomId: string;
  userId: string;
  userName: string;
  onMessage: (message: any) => void;
  onUpdate: (message: any) => void;
  onDelete: (messageId: string) => void;
  onPresenceUpdate?: (count: number) => void;
  onStatusChange?: (status: string) => void;
}

export class ChatRealtimeManager {
  private channel: RealtimeChannel | null = null;
  private supabase: SupabaseClient;
  private config: RealtimeConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnected = false;

  constructor(supabase: SupabaseClient, config: RealtimeConfig) {
    this.supabase = supabase;
    this.config = config;
  }

  public async connect(): Promise<boolean> {
    try {
      // Clean up existing channel
      await this.disconnect();

      console.log(`[Realtime] Connecting to room: ${this.config.roomId}`);
      
      // Create channel with proper configuration
      this.channel = this.supabase.channel(`chat-room-${this.config.roomId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: this.config.userId }
        }
      });

      // Setup presence tracking
      this.channel.on('presence', { event: 'sync' }, () => {
        const state = this.channel!.presenceState();
        const userCount = Object.keys(state).length;
        this.config.onPresenceUpdate?.(userCount);
      });

      // Setup INSERT handler
      this.channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${this.config.roomId}`
        },
        (payload) => {
          console.log('[Realtime] New message:', payload.new);
          this.config.onMessage(payload.new);
        }
      );

      // Setup UPDATE handler
      this.channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${this.config.roomId}`
        },
        (payload) => {
          console.log('[Realtime] Message updated:', payload.new);
          this.config.onUpdate(payload.new);
        }
      );

      // Setup DELETE handler
      this.channel.on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${this.config.roomId}`
        },
        (payload) => {
          console.log('[Realtime] Message deleted:', payload.old.id);
          this.config.onDelete(payload.old.id);
        }
      );

      // Subscribe and track status
      return new Promise((resolve) => {
        this.channel!.subscribe(async (status) => {
          console.log(`[Realtime] Status: ${status}`);
          this.config.onStatusChange?.(status);
          
          this.isConnected = status === 'SUBSCRIBED';
          
          if (status === 'SUBSCRIBED') {
            this.reconnectAttempts = 0;
            
            // Track user presence
            await this.channel!.track({
              user_id: this.config.userId,
              user_name: this.config.userName,
              joined_at: new Date().toISOString(),
              room: this.config.roomId
            });
            
            resolve(true);
          }
          
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error(`[Realtime] Connection error: ${status}`);
            await this.handleReconnect();
            resolve(false);
          }
        });
      });

    } catch (error) {
      console.error('[Realtime] Connection failed:', error);
      return false;
    }
  }

  private async handleReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[Realtime] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`[Realtime] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(async () => {
      await this.connect();
    }, delay);
  }

  public async disconnect(): Promise<void> {
    if (this.channel) {
      try {
        await this.channel.unsubscribe();
        this.supabase.removeChannel(this.channel);
        this.channel = null;
        this.isConnected = false;
        console.log('[Realtime] Disconnected successfully');
      } catch (error) {
        console.error('[Realtime] Error during disconnect:', error);
      }
    }
  }

  public getStatus(): string {
    if (!this.channel) return 'DISCONNECTED';
    return this.isConnected ? 'CONNECTED' : 'CONNECTING';
  }
}