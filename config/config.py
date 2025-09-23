import os
from dotenv import load_dotenv

load_dotenv()

# DFX
DFX_NETWORK = os.getenv("DFX_NETWORK")

# ASI1 API settings
ASI1_API_KEY = os.getenv("ASI1_API_KEY")
ASI1_BASE_URL = "https://api.asi1.ai/v1"
ASI1_HEADERS = {
    "Authorization": f"Bearer {ASI1_API_KEY}",
    "Content-Type": "application/json"
}