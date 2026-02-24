function Login({ onLogin }) {
  function handleSubmit(event) {
    event.preventDefault()
    if (typeof onLogin === 'function') {
      onLogin()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">
          Receipt Radar
        </h1>
        <p className="text-sm text-slate-500 mb-6 text-center">
          Sign in to scan receipts and monitor fraud.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 rounded-md bg-slate-800 text-white text-sm font-medium py-2.5 hover:bg-slate-700 transition-colors"
          >
            Sign in
          </button>
        </form>

       
      </div>
    </div>
  )
}

export default Login

