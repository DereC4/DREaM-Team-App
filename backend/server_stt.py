from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
import asyncio
import tempfile
import httpx
from pydantic import BaseModel, Field
import shutil


from stt_opensource.stt import transcribe_audio

# Define a Pydantic model for the input data to TTS
class TextToSpeechInput(BaseModel):
    language: str
    text: str

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)

# Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Specify the allowed origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPPORTED_FORMATS = ["mp3", "wav"]

arr_string = []

async def send_text_to_tts_server(text: str, language: str = "english"):
    tts_server_url = "http://localhost:8005/tts/"  # Adjust the port if your TTS server runs on a different one
    timeout = httpx.Timeout(60.0, connect=60.0)  # 60 seconds timeout for both the connect and read operations
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(tts_server_url, json={"language": language, "text": text})
        if response.status_code == 200:
            return response.content
        else:
            raise HTTPException(status_code=response.status_code, detail="TTS service failed")

@app.post("/transcribe/")
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    # Check MIME type
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in SUPPORTED_FORMATS:
        raise HTTPException(status_code=400, detail=f"Unsupported file format: {file_extension}")

    try:
        # Save temporary audio file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name

        logging.info(f"File {file.filename} saved, starting transcription.")

        # Transcribe audio using the transcription service
        transcription = transcribe_audio(temp_file_path)

        logging.info(f"Transcription completed for {file.filename}.")
        logging.info(f"Transcription: {transcription}.")

        # Optionally remove temporary file after transcription
        os.remove(temp_file_path)

        return {"transcription": transcription}
    except Exception as e:
        logging.error(f"Error during transcription: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/transcribe/")
async def hello_world():
    return {"transcription": arr_string[-1] if arr_string else "No transcriptions yet."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)