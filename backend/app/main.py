import time
import json
import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddle