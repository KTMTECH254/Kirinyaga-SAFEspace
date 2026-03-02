export default function EmergencyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white px-4 py-10">
      <main className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-red-700">Emergency Help</h1>
          <p className="mt-3 text-gray-700">
            If you are in immediate danger, call emergency services now.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href="tel:112"
              className="rounded-xl bg-red-600 px-4 py-3 text-center font-semibold text-white hover:bg-red-700"
            >
              Call 112
            </a>
            <a
              href="tel:999"
              className="rounded-xl bg-red-600 px-4 py-3 text-center font-semibold text-white hover:bg-red-700"
            >
              Call 999
            </a>
          </div>

          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="font-semibold text-blue-900">24/7 Crisis Line</p>
            <a href="tel:0800221444" className="mt-1 block text-2xl font-bold text-blue-700">
              0800 221 444
            </a>
            <p className="mt-1 text-sm text-blue-900">Free, confidential, immediate support.</p>
          </div>

          <p className="mt-6 text-sm text-gray-600">
            This platform supports your wellbeing but does not replace emergency or clinical care.
          </p>
        </div>
      </main>
    </div>
  );
}
