from fastapi import HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import torch
from tts_opensource.openvoice import se_extractor
from tts_opensource.openvoice.api import BaseSpeakerTTS, ToneColorConverter
from melo.api import TTS
import os

# Define a Pydantic model for the input data
class TextToSpeechInput(BaseModel):
    version: Optional[int] = 2
    language: str = Field(default_factory=str, alias="language")
    text: str
    voice: Optional[str] = 'default'
    speed: Optional[float] = 1.0
    reference_speaker: Optional[str] = None

class TextToSpeech():
    def __init__(self):

        # Migration to Kubernetes

        # # Determine if CUDA is available and set the device accordingly
        self.device = "cuda:0" if torch.cuda.is_available() else "cpu"
        
        # # Define output directories for version 1 and version 2
        self.output_dir_v1 = 'tts_opensource/outputs'
        self.output_dir_v2 = 'tts_opensource/outputs_v2'
        # Ensure output directories exist
        os.makedirs(self.output_dir_v1, exist_ok=True)
        os.makedirs(self.output_dir_v2, exist_ok=True)
        
        # # Define checkpoint directories for tone color converter for both versions
        self.ckpt_converter_v1 = 'tts_opensource/checkpoints/converter'
        self.ckpt_converter_v2 = 'tts_opensource/checkpoints_v2/converter'
        
        # Map languages to their abbreviations
        self.language_to_abbreviation = {
            'english': 'EN',
            'spanish': 'ES',
            'french': 'FR',
            'chinese': 'ZH',
            'japanese': 'JP',
            'korean': 'KR'
        }

    def convert_text_to_speech_v1(self, input: TextToSpeechInput):
        # Check if the requested language is supported
        if input.language not in self.language_to_resources:
            raise HTTPException(status_code=400, detail=f"Unsupported language: {input.language}")
        resources = self.language_to_resources[input.language]
        
        # Initialize the base speaker TTS and tone color converter with version 1 checkpoints
        base_speaker_tts = BaseSpeakerTTS(f'{resources["checkpoint"]}/config.json', device=self.device)
        base_speaker_tts.load_ckpt(f'{resources["checkpoint"]}/checkpoint.pth')
        tone_color_converter = ToneColorConverter(f'{self.ckpt_converter_v1}/config.json', device=self.device)
        tone_color_converter.load_ckpt(f'{self.ckpt_converter_v1}/checkpoint.pth')
        
        # Load the source speaker embedding
        source_se = torch.load(resources["source_se"]).to(self.device)
        
        # Define the source and save paths for the output audio
        src_path = f'{self.output_dir_v1}/tmp.wav'
        save_path = f'{self.output_dir_v1}/output.wav'
        
        # Generate TTS and convert tone color
        base_speaker_tts.tts(input.text, src_path, speaker=input.voice, language=input.language.capitalize(), speed=input.speed)
        
        # Adjusted to use input.reference_speaker
        reference_speaker = input.reference_speaker if input.reference_speaker else 'tts_opensource/resources/derek_chen.mp3'
        target_se, _ = se_extractor.get_se(reference_speaker, tone_color_converter, target_dir='processed', vad=True)
        tone_color_converter.convert(audio_src_path=src_path, src_se=source_se, tgt_se=target_se, output_path=save_path, message="@MyShell")
        
        return save_path  # Return the path of the generated audio file

    def convert_text_to_speech_v2(self, input: TextToSpeechInput):
        # Initialize the tone color converter with version 2 checkpoints
        tone_color_converter = ToneColorConverter(f'{self.ckpt_converter_v2}/config.json', device=self.device)
        tone_color_converter.load_ckpt(f'{self.ckpt_converter_v2}/checkpoint.pth')
        
        # Adjusted to use input.reference_speaker
        reference_speaker = input.reference_speaker if input.reference_speaker else 'tts_opensource/resources/default_reference.mp3'
        target_se, _ = se_extractor.get_se(reference_speaker, tone_color_converter, vad=False)
        
        # Define the source path for the temporary audio file
        src_path = f'{self.output_dir_v2}/tmp.wav'
        language_abbr = self.language_to_abbreviation[input.language]
        
        # Initialize the TTS model for the specified language
        model = TTS(language=language_abbr, device=self.device)
        speaker_ids = model.hps.data.spk2id
        
        # Process TTS for each speaker and convert tone color
        for speaker_key, speaker_id in speaker_ids.items():
            speaker_key = speaker_key.lower().replace('_', '-')
            source_se = torch.load(f'tts_opensource/checkpoints_v2/base_speakers/ses/{speaker_key}.pth', map_location=self.device)
            model.tts_to_file(input.text, speaker_id, src_path, speed=input.speed)
            save_path = f'{self.output_dir_v2}/output_v2_{speaker_key}.wav'
            tone_color_converter.convert(audio_src_path=src_path, src_se=source_se, tgt_se=target_se, output_path=save_path, message="@MyShell")
        
        return save_path  # Return the path of the last generated audio file

    def process_text_to_speech(self, input: TextToSpeechInput) -> str:
        # Process the text-to-speech request based on the specified version
        if input.version == 1:
            return self.convert_text_to_speech_v1(input)
        elif input.version == 2:
            return self.convert_text_to_speech_v2(input)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported version: {input.version}")