#include <opencv2/opencv.hpp>
#include <sl/Camera.hpp>
#include "mjpeg_streamer.hpp"

using namespace std;
using namespace sl;

// for convenience
using MJPEGStreamer = nadjieb::MJPEGStreamer;

void print(string msg_prefix, ERROR_CODE err_code = ERROR_CODE::SUCCESS, string msg_suffix = "");

int main()
{
    #ifdef _SL_JETSON_
        const bool isJetson = true;
    #else
        const bool isJetson = false;
    #endif

    cout << "Program starting...\nisJetson: " << isJetson << endl;

    // Create ZED objects
    Camera zed;
    InitParameters init_parameters;
    init_parameters.camera_resolution = RESOLUTION::HD720;
    // On Jetson the object detection combined with an heavy depth mode could reduce the frame rate too much
    init_parameters.depth_mode = isJetson ? DEPTH_MODE::PERFORMANCE : DEPTH_MODE::ULTRA;
    init_parameters.coordinate_system = COORDINATE_SYSTEM::RIGHT_HANDED_Y_UP;
    init_parameters.coordinate_units = UNIT::METER;

    // Open the camera
    auto returned_state = zed.open(init_parameters);
    if (returned_state != ERROR_CODE::SUCCESS) {
        print("Open Camera", returned_state, "\nExit program.");
        zed.close();
        return EXIT_FAILURE;
    }

    // Enable Positional tracking (mandatory for object detection)
    PositionalTrackingParameters positional_tracking_parameters;
    //If the camera is static, uncomment the following line to have better performances and boxes sticked to the ground.
    positional_tracking_parameters.set_as_static = true;
    returned_state = zed.enablePositionalTracking(positional_tracking_parameters);
    if (returned_state != ERROR_CODE::SUCCESS) {
        print("enable Positional Tracking", returned_state, "\nExit program.");
        zed.close();
        return EXIT_FAILURE;
    }

    // Enable the Objects detection module
    ObjectDetectionParameters obj_det_params;
    obj_det_params.enable_tracking = true; // track people across images flow
    obj_det_params.enable_body_fitting = true; // smooth skeletons moves
    obj_det_params.detection_model = isJetson ? DETECTION_MODEL::HUMAN_BODY_FAST : DETECTION_MODEL::HUMAN_BODY_ACCURATE;

    returned_state = zed.enableObjectDetection(obj_det_params);
    if (returned_state != ERROR_CODE::SUCCESS) {
        print("enable Object Detection", returned_state, "\nExit program.");
        zed.close();
        return EXIT_FAILURE;
    }

    // Configure object detection runtime parameters
    ObjectDetectionRuntimeParameters objectTracker_parameters_rt;
    objectTracker_parameters_rt.detection_confidence_threshold = 50;

    // Create ZED Objects filled in the main loop
    Objects bodies;
    Mat image;

    vector<int> params = {cv::IMWRITE_JPEG_QUALITY, 50};

    MJPEGStreamer streamer;

    // By default "/shutdown" is the target to graceful shutdown the streamer
    // if you want to change the target to graceful shutdown:
    //      streamer.setShutdownTarget("/stop");

    // By default 1 worker is used for streaming
    // if you want to use 4 workers:
    //      streamer.start(8080, 4);
    streamer.start(8080);

    cout << "Streamer started!\n(go to '.../shutdown' to close the program)" << endl;

    // Visit /shutdown or another defined target to stop the loop and graceful shutdown
    while (streamer.isAlive())
    {
        if (zed.grab() == ERROR_CODE::SUCCESS) {

            // Retrieve left image
            zed.retrieveImage(image, VIEW::LEFT);

            // Retrieve Detected Human Bodies
            zed.retrieveObjects(bodies, objectTracker_parameters_rt);
            
            cv::Mat cvImage(image.getHeight(), image.getWidth(), (image.getChannels() == 1) ? CV_8UC1 : CV_8UC4, image.getPtr<sl::uchar1>(sl::MEM::CPU));

            for (auto i = bodies.object_list.rbegin(); i != bodies.object_list.rend(); ++i) {
                ObjectData& obj = (*i);
                auto &bb_ = obj.head_bounding_box_2d;
                if(bb_.size() > 0) { 
                    int x1 = bb_[0].x;
                    int y1 = bb_[0].y;
                    int x2 = bb_[2].x;
                    int y2 = bb_[2].y;
                    cv::Point pt1(x1, y1);
                    cv::Point pt2(x2, y2);
                    cv::rectangle(cvImage, pt1, pt2, cv::Scalar(0, 255, 0));
                }
            }

            // http://localhost:8080/
            vector<uchar> buff_bgr;
            cv::imencode(".jpg", cvImage, buff_bgr, params);
            streamer.publish("/", string(buff_bgr.begin(), buff_bgr.end()));
        } else {
            continue;
        }
    }

    cout << "Closing..." << endl;

    streamer.stop();

    // Release objects
    image.free();
    bodies.object_list.clear();

    // Disable modules
    zed.disableObjectDetection();
    zed.disablePositionalTracking();
    zed.close();
    cout << "Closed!" << endl;
    return EXIT_SUCCESS;
}

void print(string msg_prefix, ERROR_CODE err_code, string msg_suffix) {
    if (err_code != ERROR_CODE::SUCCESS)
        cout << "[Error]";    
    cout << " "<< msg_prefix << " ";
    if (err_code != ERROR_CODE::SUCCESS) {
        cout << " | " << toString(err_code) << " : ";
        cout << toVerbose(err_code);
    }
    if (!msg_suffix.empty())
        cout << " " << msg_suffix;
    cout << endl;
}
