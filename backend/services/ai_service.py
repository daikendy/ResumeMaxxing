import json
import asyncio
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv
from utils.logging_config import logger

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# 1. THE SWITCH: You physically change this word to True or False
MOCK_MODE = False

async def tailor_resume(raw_resume: dict, job_description: str, job_title: str) -> dict:
    """
    Takes the user's raw resume and the job description, 
    returns a JSON object with the tailored resume.
    """

    if MOCK_MODE:
        logger.info("AI_MOCK_MODE_ACTIVE", service="tailor_resume")
        await asyncio.sleep(2) # Simulate delay
        
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
    
    # NEW: Preprocess the Job Description to filter noise
    processed_jd = await preprocess_job_description(job_description)
    if processed_jd:
        jd_context = f"""
        CLEANED JOB SUMMARY: {processed_jd.get('clean_summary')}
        CORE REQUIRED SKILLS: {", ".join(processed_jd.get('core_skills', []))}
        KEY RESPONSIBILITIES: {", ".join(processed_jd.get('key_responsibilities', []))}
        KEY PRIORITIES/VIBE: {", ".join(processed_jd.get('priorities', []))}
        """
    else:
        jd_context = job_description

    system_prompt = """
    You are an expert ATS-Optimization Career Coach and a high-precision ATS-compliant machine.
    Your job is to rewrite the user's resume JSON to perfectly align with the provided Target Job Description and Target Job Title.
    
    CRITICAL RULES:
    1. STRICT TRUTH CONSTRAINT: You MUST NEVER invent fake experience.
    2. HIGH-IMPACT SPECIFICITY: You MUST prioritize using the most impactful and specific details from the user's Master Profile (e.g., "shipped in 6 weeks", "reduced latency by 40%", "AI-augmented workflows"). DO NOT convert crisp, metric-driven master profile bullets into generic, vague AI-generated ones.
    3. ANTI-HALLUCINATION GUARDRAIL: DO NOT add any technologies (e.g., Python, Docker) if they are not explicitly listed in the User's Master Profile JSON. 
    4. EXPERIENCE INTEGRITY: Even if a skill (like Python) is in the user's "Skills" list, DO NOT add it to a specific company's "Experience" bullet points unless it was already mentioned in the original description of that specific role. Do not "leak" skills into roles where they weren't used.
    5. MANDATORY SECTION PRESERVATION: You MUST return a complete JSON object containing EVERY section: 'contact', 'summary', 'experience', 'education', 'skills', and 'projects'.
    6. TAILORING LOGIC: 
       - Experience: Rewrite bullet points for impact using JD keywords. You MUST use markdown bolding (**text**) to highlight key tools, metrics, or achievements (e.g., "**Python**", "**+45% efficiency**").
       - Projects: Rephrase to align with the role, keeping tool context.
       - Skills: Curate for relevance, keeping ONLY what the user knows.
    7. COMPANY ALIGNMENT: Use the 'Analyzed Job Context' to understand not just skills, but the COMPANY'S VIBE (e.g., fast-paced, scale-focused, quality-obsessed) and tailor the tone accordingly.
    8. DATA INTEGRITY: You MUST strictly PRESERVE the following fields for EVERY experience and project entry: 'startDate', 'endDate', 'location', 'technologies', and 'gpa'. They are metadata that must not be lost or hallucinated.
    9. FORMATTING ENFORCEMENT: The 'bullets' array for Experience and Projects MUST contain individual, punchy bullet points only. You are STRICTLY FORBIDDEN from writing paragraphs or combining multiple ideas into a single massive block of text.
    10. Return strict JSON that mirrors the user's master profile structure perfectly.
    """

    user_prompt = f"""
    Target Job Title: {job_title}
    Target Job Context (Analyzed):
    {jd_context}
    
    Original Job Description (for reference):
    {job_description[:2000]}
    
    My Current Resume JSON:
    {json.dumps(raw_resume)}
    """

    try:
        start_time = asyncio.get_event_loop().time()
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={ "type": "json_object" },
            temperature=0.2,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            timeout=60.0
        )
        latency = (asyncio.get_event_loop().time() - start_time) * 1000
        
        tokens = getattr(response.usage, "total_tokens", 0) if response.usage else 0
        logger.info("AI_GENERATION_SUCCESS", 
                    service="tailor_resume", 
                    latency_ms=f"{latency:.2f}ms", 
                    tokens=tokens)

        # Parse the AI's string response back into a Python dictionary
        content = response.choices[0].message.content
        if content is None:
            raise Exception("AI returned empty content")
        tailored_json: dict = json.loads(content)
        return tailored_json
        
    except Exception as e:
        logger.error("AI_GENERATION_FAILED", service="tailor_resume", error=str(e))
        raise Exception(f"AI Tailoring Failed: {str(e)}")


async def extract_resume_data(pdf_text: str) -> dict:
    """
    Takes raw messy PDF text and structures it into the target MasterResume JSON format.
    """
    
    if MOCK_MODE:
        return {
            "contact": {"name": "Mocked PDF Extraction", "email": "mock@test.com", "phone": "+1 555-0000", "github": "github.com/mock", "linkedin": "linkedin.com/in/mock"},
            "experience": [{"title": "Mock PDF Reader", "company": "Mock Inc", "bullets": ["Read a PDF using Mocking."]}]
        }

    system_prompt = """
    You are an expert Resume Data Extractor.
    Your job is to read raw, unstructured text extracted from a user's PDF resume and perfectly map it to our strict JSON schema.
    
    CRITICAL RULES:
    1. NEVER invent data. Only extract what is present.
    2. Extract Summary: a concise professional summary or objective if present.
    3. Extract Experience: include "title", "company", "location", "startDate", "endDate", "technologies", and a list of "bullets". 
    4. Extract Education: include "institution", "degree", "year", "location", and "gpa".
    5. Extract Skills: a flat list of technical and soft skills.
    6. Extract Projects: include "title", "description", "startDate", "endDate", and "technologies".
    7. CONTACT DETAILS: Extract ALL available contact info:
       - "phone": The candidate's phone number (any format).
       - "github": GitHub profile URL or username. Return just the URL without https:// prefix.
       - "linkedin": LinkedIn profile URL or username. Return just the URL without https:// prefix.
       - NOTE: The text may contain a "[HYPERLINKS]" section at the end with URLs extracted from PDF annotations. Cross-reference these with any visible link text in the resume body to identify GitHub and LinkedIn URLs.
    7. If a field is not found, set it to an empty string "". Do NOT omit it.
    
    Return exactly this JSON format:
    {
      "contact": { "name": "...", "email": "...", "phone": "...", "github": "...", "linkedin": "..." },
      "summary": "...",
      "experience": [
         { "title": "...", "company": "...", "location": "...", "startDate": "...", "endDate": "...", "technologies": "...", "bullets": ["..."] }
      ],
      "education": [
         { "institution": "...", "degree": "...", "year": "...", "location": "...", "gpa": "..." }
      ],
      "skills": ["..."],
      "projects": [
         { "title": "...", "description": "...", "location": "...", "startDate": "...", "endDate": "...", "technologies": "..." }
      ]
    }
    """

    user_prompt = f"Raw Resume Text:\n{pdf_text}"

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            timeout=60.0
        )
        content = response.choices[0].message.content
        if content is None:
            raise Exception("AI returned empty content")
        return json.loads(content)
    except Exception as e:
        logger.error("AI_PDF_PARSE_FAILED", error=str(e))
        raise Exception(f"Failed to parse PDF using OpenAI: {str(e)}")

async def preprocess_job_description(jd_text: str):
    """
    Extracts core technical requirements and responsibilities from a messy JD.
    """
    system_prompt = """
    You are an expert ATS (Applicant Tracking System) parser and Job Analyst. 
    Your goal is to extract the ESSENTIAL requirements and THE VIBE of a job description.
    
    Output a JSON object with:
    1. 'core_skills': List of technical skills/tools.
    2. 'key_responsibilities': Short list of main duties.
    3. 'clean_summary': A 2-sentence summary of what they are looking for.
    4. 'priorities': List of what the company values most (e.g., "speed", "scale", "AI innovation", "design-driven").
    """
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Job Description:\n{jd_text}"}
            ],
            timeout=30.0
        )
        content = response.choices[0].message.content
        if content is None:
            return None
        return json.loads(content)
    except Exception as e:
        logger.error("JD_PREPROCESS_FAILED", error=str(e))
        return None

async def summarize_master_resume(resume_data: dict) -> str:
    """
    Analyzes the resume data and generates a punchy 3-5 word summary 
    to be used as the snapshot name.
    """
    if MOCK_MODE:
        return "Software Engineer (V1 System Snapshot)"

    system_prompt = """
    You are a career console AI. 
    Review the user's resume and generate a 3-5 word high-level summary of their identity.
    Examples: 
    - Senior Fullstack Engineer (React/Go)
    - DevOps Architect (AWS/K8s)
    - Junior Data Scientist (Python)
    
    CRITICAL: Output ONLY the summary string. No JSON, no extra words.
    """
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Resume Data: {json.dumps(resume_data)[:2000]}"}
            ],
            temperature=0.3,
            timeout=15.0
        )
        content = response.choices[0].message.content
        return content.strip() if content else f"Snapshot - {asyncio.get_event_loop().time()}"
    except Exception as e:
        logger.error("AI_SUMMARY_FAILED", error=str(e))
        return f"Snapshot - {asyncio.get_event_loop().time()}"
