import json
import os

# Load mock data from JSON file
def load_mock_data():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(current_dir, 'mock_data.json')
    
    with open(json_path, 'r') as f:
        data = json.load(f)
        return {"transactions": data["transactions"]}

# Load the mock data
MOCK_TRANSACTIONS = load_mock_data()

