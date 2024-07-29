# iicteam9

Our team plans to integrate Artificial Intelligence (AI) into call center operations, aiming to deliver AI-assisted responses that are linguistically tailored to each caller's preferences and needs. This cutting-edge approach is designed to ensure that all communications are not only efficient and personalized but also conducted in the language or dialect that the customer feels most comfortable with. Using open source models as a proof of concept, we can show how one person's voice can be adapted to many different languages. 

Short video demo of our intern team project

[![our language assist software presented in the form of a lively skit](https://img.youtube.com/vi/aaSROhvLcQM/0.jpg)](https://www.youtube.com/watch?v=aaSROhvLcQM)


Checkpoints for download and extraction:
```
V1: https://myshell-public-repo-hosting.s3.amazonaws.com/openvoice/checkpoints_1226.zip
V2: https://myshell-public-repo-hosting.s3.amazonaws.com/openvoice/checkpoints_v2_0417.zip
```

To run the TTS services, first install via:
```bash
pip install -r requirements.txt
python -m unidic download
```

Then, run the TTS FastAPI server using:
```bash
unvicorn server_tts_opensource:app --reload
```

Resources we used:
https://github.com/openai/whisper
https://github.com/myshell-ai/OpenVoice
