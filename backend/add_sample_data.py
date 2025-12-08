"""
Script to populate the database with sample service requests for demo purposes.
Run this script after starting the Flask app to add mock data.
"""

import requests
import time

# API endpoint
BASE_URL = "http://127.0.0.1:5001/api"

# Sample service requests
sample_requests = [
    {
        "category": "Maintenance",
        "description": "The AC in D-Block room 205 is not working. It's been making loud noises and not cooling properly. Students are having difficulty focusing during lectures."
    },
    {
        "category": "IT Support",
        "description": "WiFi connection keeps dropping in the Library computer lab. Unable to complete online assignments. Please check the FCCU-Student network."
    },
    {
        "category": "Academic",
        "description": "Need help understanding the new course registration system. Cannot find the Computer Science electives for next semester on the student portal."
    },
    {
        "category": "Lost & Found",
        "description": "Lost my student ID card near the Lucas Center yesterday around 4 PM. It's a blue card with my name 'Ahmed Khan' and ID number FC-2023-1234."
    },
    {
        "category": "Maintenance",
        "description": "Light bulbs in S-Block corridor (2nd floor) are not working. The hallway is very dark, especially during evening classes. Safety concern."
    }
]

def add_sample_requests():
    """Add sample service requests to the database"""
    print("🚀 Adding sample service requests to database...\n")
    
    for i, req in enumerate(sample_requests, 1):
        try:
            response = requests.post(
                f"{BASE_URL}/requests",
                json=req,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 201:
                print(f"✅ Request {i}/{len(sample_requests)} added: {req['category']}")
            else:
                print(f"❌ Failed to add request {i}: {response.status_code}")
                print(f"   Error: {response.text}")
        except Exception as e:
            print(f"❌ Error adding request {i}: {str(e)}")
        
        time.sleep(0.3)  # Small delay between requests
    
    print(f"\n✨ Done! Added {len(sample_requests)} sample requests to the database.")
    print("You can now view them in the admin dashboard.\n")

if __name__ == "__main__":
    print("=" * 60)
    print("📊 SAMPLE DATA POPULATION SCRIPT")
    print("=" * 60)
    print("\nMake sure the Flask backend is running on http://127.0.0.1:5001")
    input("Press Enter to continue or Ctrl+C to cancel... ")
    
    add_sample_requests()
