# IntProj

Interdisciplinary project for the ICT4SS master's degree (Politecnico di Torino).

## Description

Real-time mask and social distancing detection system built with Python and Darknet YOLOv4-tiny. The system relies on the Stereolabs ZED 2 stereo camera and its SDK, 
which exploits CUDA acceleration to perform spatial mapping and position estimation in real-time, and was tested on the NVIDIA Jetson Nano SBC. Additionally, the system implements statistics collection by using a MongoDB database. The administrators of the system can then view the statistics in a very simple web application.