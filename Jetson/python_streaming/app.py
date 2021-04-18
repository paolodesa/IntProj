import sys
import pyzed.sl as sl
import numpy as np
import cv2
from flask import Flask, render_template, Response
import atexit
import time

print("Running Head Tracking...")

app = Flask(__name__)

# Create a Camera object
zed = sl.Camera()

# Create a InitParameters object and set configuration parameters
init_params = sl.InitParameters()
init_params.camera_resolution = sl.RESOLUTION.HD1080  # Use HD720 video mode
init_params.camera_fps = 15
init_params.coordinate_units = sl.UNIT.METER         # Set coordinate units
init_params.coordinate_system = sl.COORDINATE_SYSTEM.RIGHT_HANDED_Y_UP

# Open the camera
err = zed.open(init_params)
if err != sl.ERROR_CODE.SUCCESS:
    exit(1)

# Enable Positional tracking (mandatory for object detection)
positional_tracking_parameters = sl.PositionalTrackingParameters()
# If the camera is static, uncomment the following line to have better performances and boxes sticked to the ground.
positional_tracking_parameters.set_as_static = True
zed.enable_positional_tracking(positional_tracking_parameters)
    
obj_param = sl.ObjectDetectionParameters()
#obj_param.enable_body_fitting = True        # Smooth skeleton move
obj_param.detection_model = sl.DETECTION_MODEL.HUMAN_BODY_FAST

# Enable Object Detection module
zed.enable_object_detection(obj_param)

obj_runtime_param = sl.ObjectDetectionRuntimeParameters()
obj_runtime_param.detection_confidence_threshold = 50

# Create ZED objects filled in the main loop
bodies = sl.Objects()
image = sl.Mat()


def get_frames():    
    while True:
        start_time = time.time()
        # Grab an image
        if zed.grab() == sl.ERROR_CODE.SUCCESS:
            # Retrieve left image
            zed.retrieve_image(image, sl.VIEW.LEFT)
            # Retrieve objects
            zed.retrieve_objects(bodies, obj_runtime_param)
            img = image.get_data()
            for obj in bodies.object_list:    # bodies.object_list crashes the script (bad_alloc)
                centroid = obj.head_position
                #print(f"x:{centroid[0]},y:{centroid[1]},z:{centroid[2]}")
                box = obj.bounding_box_2d
                start = (int(box[0][0]), int(box[0][1]))
                end = (int(box[2][0]), int(box[2][1]))
                cv2.rectangle(img, start, end, (0, 0, 255), 2)
                cv2.putText(img, f'ID: {obj.id}', (start[0], start[1]-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0,0,255), 2)
            ret, buffer = cv2.imencode('.jpg', img)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            print("FPS: {}".format(1.0 / (time.time() - start_time)))
        else:
            continue


def cleanup():
    print("Closing the application...")
    image.free(sl.MEM.CPU)
    # Disable modules and close camera
    zed.disable_object_detection()
    zed.disable_positional_tracking()
    zed.close()


@app.route('/video_feed')
def video_feed():
    #Video streaming route. Put this in the src attribute of an img tag
    return Response(get_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/')
def index():
    """Video streaming home page."""
    return render_template('index.html')


if __name__ == '__main__':
    atexit.register(cleanup)
    app.run(host='0.0.0.0', debug=False)
