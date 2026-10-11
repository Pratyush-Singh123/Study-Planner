import subprocess, os, shutil, tempfile

def deploy():
    cwd = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print("🚀 Building production frontend bundle...")
    subprocess.run(['npm', '--prefix', 'frontend', 'run', 'build'], cwd=cwd, check=True)

    dist_dir = os.path.join(cwd, 'frontend', 'dist')
    if not os.path.exists(dist_dir):
        raise RuntimeError("dist directory not found after build")

    print("📦 Packaging static assets for GitHub Pages...")
    with tempfile.TemporaryDirectory() as tmp:
        for item in os.listdir(dist_dir):
            s = os.path.join(dist_dir, item)
            d = os.path.join(tmp, item)
            if os.path.isdir(s):
                shutil.copytree(s, d)
            else:
                shutil.copy2(s, d)

        # Add .nojekyll
        with open(os.path.join(tmp, '.nojekyll'), 'w') as f:
            f.write('')

        subprocess.run(['git', 'init'], cwd=tmp, check=True)
        subprocess.run(['git', 'checkout', '-b', 'gh-pages'], cwd=tmp, check=True)
        subprocess.run(['git', 'add', '-A'], cwd=tmp, check=True)
        subprocess.run(['git', 'commit', '-m', 'deploy: publish GapFill to GitHub Pages'], cwd=tmp, check=True)

        remote_url = subprocess.check_output(['git', 'remote', 'get-url', 'origin'], cwd=cwd, text=True).strip()
        print(f"📡 Pushing to {remote_url} on branch gh-pages...")
        res = subprocess.run(['git', 'push', '-f', remote_url, 'gh-pages'], cwd=tmp, check=True)
        print("✅ Published successfully to GitHub Pages!")

if __name__ == '__main__':
    deploy()
