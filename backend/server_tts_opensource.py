from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse 
from tts_opensource.tts_opensource import TextToSpeech, TextToSpeechInput

app = FastAPI()

@app.post("/tts/", response_class=FileResponse)
async def create_audio(input: TextToSpeechInput):
    tts_processor = TextToSpeech()
    if not input.text:
        raise HTTPException(status_code=400, detail="The text field cannot be empty")
    audio_path = tts_processor.process_text_to_speech(input)
    return FileResponse(path=audio_path, filename="output.wav", media_type='audio/wav')