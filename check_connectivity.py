import requests

def check_services():
    services = {
        "Frontend": "http://localhost:3000",
        "Edge Service": "http://localhost:8000/docs",
        "Cloud Service": "http://localhost:9000/health",
        "Ollama": "http://localhost:11434"
    }
    
    for name, url in services.items():
        try:
            resp = requests.get(url, timeout=2)
            if resp.status_code < 400 or (name == "Frontend" and resp.status_code == 200):
                print(f"✅ {name} is ONLINE")
            else:
                print(f"⚠️ {name} is reachable but returned {resp.status_code}")
        except Exception as e:
            print(f"❌ {name} is OFFLINE ({e})")

if __name__ == "__main__":
    check_services()
