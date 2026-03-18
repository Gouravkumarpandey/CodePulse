import sys

def rebuild(file_path, is_login=True):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Clean LoginPage previous step state if any
    if is_login:
        for i, line in enumerate(lines[:130]):
            if 'const [step, setStep] = useState(1);' in line:
                lines[i] = "\n" 
                break

    # Find bottom-most return statement index
    return_idx = -1
    for i in range(len(lines) - 1, -1, -1):
        if 'return (' in lines[i]:
            return_idx = i
            break
            
    if return_idx == -1:
        print(f"Could not find return statement in {file_path}")
        return

    img_url = "https://media.licdn.com/dms/image/v2/D4E22AQHN0UpguKUknw/feedshare-shrink_800/B4EZYABLOwGgAg-/0/1743757033731?e=2147483647&v=beta&t=NIAi0HBe3_c8o396DPK9-0UU70blAVQWrvFNO5-bUgk" if is_login else "/auth.webp"
    overlay = "" if is_login else '<div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />'
    h1_title = "Codepulse" if is_login else "Join Codepulse"
    p_subtext = "Welcome back! Please sign in to continue" if is_login else "Join CodePulse to start tracking activity today"
    
    if is_login:
        form_layout = """          <form onSubmit={handleEmailLogin} className="w-full flex flex-col gap-4">
            {/* Email */}
            <div className="w-full">
              <label className="block text-base font-bold text-neutral-400 uppercase mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center border border-white rounded-md focus-within:border-neutral-400 transition-colors">
                <Mail className="absolute left-4 w-5 h-5 text-white flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-none rounded-md pl-14 pr-4 py-4 text-base text-white placeholder-neutral-500 focus:outline-none font-sans"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="w-full">
              <label className="block text-base font-bold text-neutral-400 uppercase mb-1.5">
                Password
              </label>
              <div className="relative flex items-center border border-white rounded-md focus-within:border-neutral-400 transition-colors">
                <Lock className="absolute left-4 w-5 h-5 text-white flex-shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-none rounded-md pl-14 pr-14 py-4 text-base text-white placeholder-neutral-500 focus:outline-none font-sans"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-neutral-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold uppercase py-5 rounded-md text-base hover:bg-neutral-200 transition-colors mt-2 flex items-center justify-center tracking-wider"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Sign In To CodePulse'
              )}
            </button>
          </form>

          <p className="text-sm text-neutral-400 font-bold uppercase mt-6">
            Don't have an account?{' '}
            <button type="button" onClick={() => navigate('/signup')} className="text-white hover:underline">
              Create a free account
            </button>
          </p>"""
    else:
        form_layout = """          <form onSubmit={handleEmailSignup} className="w-full flex flex-col gap-3">
            {/* Full Name */}
            <div className="w-full">
              <label className="block text-base font-bold text-neutral-400 uppercase mb-1.5">
                Full Name
              </label>
              <div className="relative flex items-center border border-white rounded-md focus-within:border-neutral-400 transition-colors">
                <User className="absolute left-4 w-5 h-5 text-white flex-shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-none rounded-md pl-14 pr-4 py-4 text-base text-white placeholder-neutral-500 focus:outline-none font-sans"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="w-full">
              <label className="block text-base font-bold text-neutral-400 uppercase mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center border border-white rounded-md focus-within:border-neutral-400 transition-colors">
                <Mail className="absolute left-4 w-5 h-5 text-white flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-none rounded-md pl-14 pr-4 py-4 text-base text-white placeholder-neutral-500 focus:outline-none font-sans"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="w-full">
              <label className="block text-base font-bold text-neutral-400 uppercase mb-1.5">
                Password
              </label>
              <div className="relative flex items-center border border-white rounded-md focus-within:border-neutral-400 transition-colors">
                <Lock className="absolute left-4 w-5 h-5 text-white flex-shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-none rounded-md pl-14 pr-14 py-4 text-base text-white placeholder-neutral-500 focus:outline-none font-sans"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-neutral-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="w-full">
              <label className="block text-base font-bold text-neutral-400 uppercase mb-1.5">
                Confirm Password
              </label>
              <div className="relative flex items-center border border-white rounded-md focus-within:border-neutral-400 transition-colors">
                <Lock className="absolute left-4 w-5 h-5 text-white flex-shrink-0" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent border-none rounded-md pl-14 pr-14 py-4 text-base text-white placeholder-neutral-500 focus:outline-none font-sans"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 text-neutral-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold uppercase py-5 rounded-md text-base hover:bg-neutral-200 transition-colors mt-2 flex items-center justify-center tracking-wider"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-sm text-neutral-400 font-bold uppercase mt-6">
            Already have an account?{' '}
            <button type="button" onClick={() => navigate('/login')} className="text-white hover:underline">
              Sign In
            </button>
          </p>"""

    full = """  return (
    <div className="min-h-screen w-full bg-black flex flex-col lg:flex-row text-white overflow-hidden" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
      {/* LEFT SIDE - Hidden on mobile, half width on desktop */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center bg-no-repeat items-center justify-center p-12 border-r border-neutral-900"
        style={{ backgroundImage: 'url(""" + img_url + """)' }}
      >
        """ + overlay + """
      </div>

      {/* RIGHT SIDE - Form layout */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[540px] flex flex-col items-center"
        >
          <h1 className="text-5xl font-bold mb-6 text-center select-none uppercase" style={{ textShadow: '3px 3px 0px #333' }}>
            """ + h1_title + """
          </h1>

          <p className="text-base text-center uppercase text-neutral-300 font-bold mb-4">
            """ + p_subtext + """
          </p>

          {error && (
            <div className="w-full bg-red-500/10 border border-red-500/20 rounded-md p-3 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-500 uppercase">{error}</p>
            </div>
          )}

          {/* Google Button */}
          <button
            onClick={() => googleLogin()}
            disabled={loading}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-4 border border-white rounded-md hover:bg-neutral-900 transition-colors text-sm font-bold uppercase"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" className="flex-shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Divider */}
          <div className="w-full flex items-center my-4">
            <div className="flex-1 h-px bg-neutral-800" />
            <span className="text-sm text-neutral-400 font-bold uppercase mx-3">or</span>
            <div className="flex-1 h-px bg-neutral-800" />
          </div>

""" + form_layout + """
        </motion.div>
      </div>
    </div>
  );
"""

    lines[return_idx:] = [full, "}\n"]

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

rebuild(r'c:\Personal Project\CodePulse\Frontend\src\pages\LoginPage.tsx', is_login=True)
rebuild(r'c:\Personal Project\CodePulse\Frontend\src\pages\SignupPage.tsx', is_login=False)

print("Success")
