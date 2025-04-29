
"""
Health check script to verify the backend is working correctly
"""
import requests
import sys

def check_backend_health():
    try:
        # Try to access the health endpoint
        response = requests.get("http://0.0.0.0:8000/health")
        
        if response.status_code == 200:
            print("✅ Backend is running correctly!")
            data = response.json()
            print(f"Health status: {data.get('status', 'unknown')}")
            return True
        else:
            print(f"❌ Backend returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend - make sure it's running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Error checking backend health: {e}")
        return False

if __name__ == "__main__":
    print("Checking backend health...")
    success = check_backend_health()
    
    if not success:
        print("\nTroubleshooting tips:")
        print("1. Make sure the backend server is running: 'cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000'")
        print("2. Check logs for any Python errors")
        print("3. Verify database connection")
        sys.exit(1)
