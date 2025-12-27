import React from "react";
import githubLogo from "../assets/github.svg";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-[#0d1117] text-white font-sans">
			{/* Header */}
			<header className="w-full border-b border-[#21262d] bg-[#161b22] px-6 py-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<img src={githubLogo} alt="GitHub" className="h-8 w-8" />
					<span className="text-2xl font-bold tracking-tight">GitHub</span>
				</div>
				<nav className="hidden md:flex gap-8 text-sm font-medium">
					<a href="#" className="hover:underline">Product</a>
					<a href="#" className="hover:underline">Solutions</a>
					<a href="#" className="hover:underline">Open Source</a>
					<a href="#" className="hover:underline">Pricing</a>
				</nav>
				<div className="flex gap-2">
					<button className="px-4 py-1 rounded-md border border-[#30363d] bg-[#238636] text-white font-semibold hover:bg-[#2ea043]">Sign up</button>
					<button className="px-4 py-1 rounded-md border border-[#30363d] bg-[#161b22] text-white font-semibold hover:bg-[#21262d]">Sign in</button>
				</div>
			</header>

			{/* Hero Section */}
			<section className="flex flex-col items-center justify-center py-24 px-4 text-center">
				<h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
					Where the world builds software
				</h1>
				<p className="text-xl md:text-2xl text-[#8b949e] mb-8 max-w-2xl">
					Millions of developers and companies build, ship, and maintain their software on GitHub — the largest and most advanced development platform in the world.
				</p>
				<form className="flex flex-col md:flex-row gap-3 w-full max-w-xl justify-center">
					<input
						type="email"
						placeholder="Email address"
						className="px-4 py-3 rounded-md border border-[#30363d] bg-[#0d1117] text-white focus:outline-none focus:ring-2 focus:ring-[#238636] flex-1"
					/>
					<button className="px-6 py-3 rounded-md bg-[#238636] text-white font-semibold hover:bg-[#2ea043] transition">Sign up for GitHub</button>
				</form>
			</section>

			{/* Footer */}
			<footer className="w-full border-t border-[#21262d] bg-[#161b22] px-6 py-8 flex flex-col md:flex-row items-center justify-between text-[#8b949e] text-sm">
				<div className="flex items-center gap-2 mb-4 md:mb-0">
					<img src={githubLogo} alt="GitHub" className="h-6 w-6" />
					<span>© {new Date().getFullYear()} GitHub, Inc.</span>
				</div>
				<div className="flex gap-6">
					<a href="#" className="hover:underline">Terms</a>
					<a href="#" className="hover:underline">Privacy</a>
					<a href="#" className="hover:underline">Security</a>
					<a href="#" className="hover:underline">Status</a>
					<a href="#" className="hover:underline">Docs</a>
				</div>
			</footer>
		</div>
	);
}
