import time
import json
import logging
import os

from fastapi import FastAPI, Request
app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware