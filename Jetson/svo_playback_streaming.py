import sys
import pyzed.sl as sl
import cv2
from flask import Flask, render_template, Response
import atexit


app = Flask(__name__)


if len(sys.argv) != 2:
    print("Please specify path to .svo file.")
    exit()

filepath = sys.argv[1]
print("Reading SVO file: {0}".format(filepath))

input_type = sl.InputType()
input_type.set_from_svo_file(filepath)
init = sl.InitParameters(input_t=input_type, svo_real_time_mode=True)
cam = sl.Camera()
status = cam.open(init)
if status != sl.ERROR_CODE.SUCCESS:
    print(repr(status))
    exit()

runtime = sl.RuntimeParameters()
mat = sl.Mat()


def get_frames():
    while True:
        err = cam.grab(runtime)
        if err == sl.ERROR_CODE.SUCCESS:
            cam.retrieve_image(mat)
            ret, buffer = cv2.imencode('.jpg', mat.get_data())
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        else:
            continue

    cam.close()
    print("\nFINISH")


def cleanup():
    print("Closing the application...")
    image.free(sl.MEM.CPU)
    # Disable modules and close camera
    zed.disable_object_detection()
    zed.disable_positional_tracking()
    zed.close()    


@app.route('/')
def index():
    return Response(get_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == "__main__":
    atexit.register(cleanup)
    app.run(host='0.0.0.0', debug=False)
