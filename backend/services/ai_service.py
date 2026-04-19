import json
import asyncio
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# 1. THE SWITCH: You physically change this word to True or False
MOCK_MODE = True

async def tailor_resume(raw_resume: dict, job_description: str, job_title: str) -> dict:
    """
    Takes the user's raw resume and the job description, 
    returns a JSON object with the tailored resume.
    """

    if MOCK_MODE:
        print("⚡ MOCK MODE ACTIVE: Bypassing OpenAI API...")
        await asyncio.sleep(2) # Simulate the network delay so frontend loading states work
        
        # Return fake but perfectly formatted JSON
        return {
            "contact": raw_resume.get("contact", {}),
            "experience": [
                {
                    "title": f"Tailored: {job_title}",
                    "company": "Mocked Company",
                    "bullets": [
                        "Successfully bypassed the ATS using optimized keywords.",
                        "Engineered a perfectly mocked database save state."
                    ]
                }
            ]
        }
    
    system_prompt = """
    You are an expert ATS-Optimization Career Coach. 
    Your job is to rewrite the user's resume bullet points to perfectly match the provided Job Description.
    Rules:
    1. Do not invent fake experience. Only reframe existing experience to highlight relevant skills.
    2. Use strong action verbs.
    3. You MUST return the result as a strict JSON object matching the user's original data structure.
    """

    user_prompt = f"""
    Target Job Title: {job_title}
    Target Job Description: {job_description}
    
    My Current Resume JSON:
    {json.dumps(raw_resume)}
    """

    response = await client.chat.completions.create(
        model="gpt-4o-mini", # Super fast, cheap, perfect for MVP
        response_format={ "type": "json_object" }, # Forces strict JSON output
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )
    
    # Parse the AI's string response back into a Python dictionary
    tailored_json = json.loads(response.choices[0].message.content)
    return tailored_json