import numpy as np
import cv2
import time
import os
import math
from models import *
import datetime


class Trackable:
    newid = 0
    def __init__(self,position,time,area):
        self.id = Trackable.newid
        self.count = 0
        Trackable.newid += 1
        self.appear_position = np.array(position)
        self.position = np.array(position)
        self.appear_time = time
        self.time = time
        self.area = area

        
    def move(self,position,time,area):
        self.position[0] = position[0]
        self.position[1] = position[1]
        self.time = time
        self.area = area
        self.count += 1

    #implement ???
    def getArea(self):
        area = 0
        for i in contour:
            area += cv2.contourArea(i)
        return area

    def save(self):
        self.last_position = self.position
        self.last_time = self.time
        self.diff_time = self.last_time - self.appear_time


    def addContour(self,contour):
        self.contours.append(contour)

    def getId(self):
        return self.id

    def __str__(self):
        return str("{\nid "+str(self.id)+
            "\nappear_position "+str(self.appear_position)+
            "\nlast_position "+str(self.last_position)+
            "\ndiff_time "+str(self.last_time - self.appear_time)+
            "\ncount "+str(self.count)+"\n}")

    def __repr__(self):
        return self.__str__()

#static var
DISTANCE_CUTOFF = 100


DRAW_COLOR = (200,200,200)
AREA_CUTOFF = 8000
EXIT_CUTOFF = (20,20)
TIME_DIFF = 30
#Method for getting first frame of video as img
def saveImg(path,options):
    cap = cv2.VideoCapture(path)
    ret,frame = cap.read()
    file_name = path.split("/")[-1].split(".")[0]+".jpeg"
    cv2.imwrite(os.path.dirname(path)+'/../img/'+file_name, frame)
    cap.release()
    return '/static/img/'+file_name;
#Method for processing the video file
def process(video,dataRelation):
    #set exit cutof from setting
    #set exit position from setting
    #set area cut of from setting
    EXIT_CUTOFF = np.array(((float(dataRelation.cameraPoint1.width) * float(dataRelation.camera.width)),(float(dataRelation.cameraPoint1.height) * float(dataRelation.camera.height))))
    START_CUTOFF = np.array(((float(dataRelation.cameraPoint2.width) * float(dataRelation.camera.width)),(float(dataRelation.cameraPoint2.height) * float(dataRelation.camera.height))))
    EXIT_POSITION = (((float(dataRelation.cameraPoint1.left) * float(dataRelation.camera.width)),(float(dataRelation.cameraPoint1.top) * float(dataRelation.camera.height))))
    START_POSITION = (((float(dataRelation.cameraPoint2.left) * float(dataRelation.camera.width)),(float(dataRelation.cameraPoint2.top) * float(dataRelation.camera.height))))
    KERNEL_PIXEL = int(dataRelation.camera.width/30)
    BLUR_PIXEL = 5
    print (START_POSITION,EXIT_POSITION)
    print (START_CUTOFF,EXIT_CUTOFF)
    cap = cv2.VideoCapture(video.url)
    #Alternative way of BackgroundSubtractor
    # fgbg = cv2.BackgroundSubtractorMOG()
    fgbg = cv2.BackgroundSubtractorMOG2(history=50,varThreshold=4,bShadowDetection=False)
    kernel = np.ones((KERNEL_PIXEL,KERNEL_PIXEL),np.uint8)
    kernel2 = np.ones((KERNEL_PIXEL,KERNEL_PIXEL),np.uint8)
    VIDEO_FPS = cap.get(5)
    peoples = []
    all_peoples = []
    start_exit = []
    end_exit = []
    frame_no = 0
    last_gen_bg = frame_no
    print "connected"
    if(video.type == 1):
        startdate = video.start_time
    while(1):
        ret, frame = cap.read()
        frame_no += 1
        # reduce fps by 5 time
        if(frame_no % 5 != 0):
            continue
        if(frame == None):
            break
        fgmask = fgbg.apply(frame)
        #noise
        fgmask = cv2.morphologyEx(fgmask, cv2.MORPH_OPEN, kernel)
        #blur
        fgmask = cv2.medianBlur(fgmask,BLUR_PIXEL)
        #threshold
        ret3,thresh = cv2.threshold(fgmask,200,255,cv2.THRESH_BINARY+cv2.THRESH_OTSU)
        #find contour
        contours,hierarchy = cv2.findContours(thresh, mode=cv2.RETR_EXTERNAL, method=cv2.CHAIN_APPROX_SIMPLE)
        total_contour_area = 0
        for cnt in contours:
            total_contour_area += cv2.contourArea(cnt)
        # print total_contour_area
        if(total_contour_area < 10 and  frame_no - last_gen_bg > 600):
            fgbg = cv2.BackgroundSubtractorMOG2(history=50,varThreshold=4,bShadowDetection=False)
            fgbg.apply(frame)
            print "reset bg"
            last_gen_bg = frame_no
            peoples = []
            continue
        #sort contourSize
        contours_sorted = np.empty((len(contours)),dtype = [('index', int), ('area', float)])
        
        if(video.type == 1):
            time = startdate + datetime.timedelta(seconds=(frame_no/VIDEO_FPS))
        else:
            time = datetime.datetime.now()
        for i in peoples:
            #check position if near exit use short time check
            if((i.position - EXIT_POSITION < EXIT_CUTOFF).all() and (i.position - EXIT_POSITION > (0,0)).all()):
                #check diff pos before save
                i.save()
                peoples.remove(i)
                if(i.diff_time > VIDEO_FPS):
                    # print "out1",i.id
                    x = i.appear_position
                    y = i.last_position
                    speed = (math.sqrt( (i.appear_position[0] - i.last_position[0])**2 + (i.appear_position[1] - i.last_position[1])**2 )/(i.diff_time/(VIDEO_FPS)))
                    speed = (dataRelation.camera_length/((dataRelation.camera_aspect*dataRelation.camera.width)/speed)) * 3.6
                    #   1m/s = 3.6km/h calc equation = length of road / (pixel of road / speed) * 3.6
                    #   50.0/(1100/245.0)*3.6
                    VideoData(data_relation=dataRelation,go_to=0,speed=speed,appear_time=time).save()
                    end_exit.append(i)
                    continue
            if((i.position - START_POSITION < START_CUTOFF).all() and (i.position - START_POSITION > (0,0)).all()):
                #check diff pos before save
                i.save()
                peoples.remove(i)
                if(i.diff_time > VIDEO_FPS and dataRelation.one_way != True):

                    # print "out2",i.id
                    speed = (math.sqrt( (i.appear_position[0] - i.last_position[0])**2 + (i.appear_position[1] - i.last_position[1])**2 )/(i.diff_time/(VIDEO_FPS)))
                    speed = (dataRelation.camera_length/((dataRelation.camera_aspect*dataRelation.camera.width)/speed)) * 3.6
                    VideoData(data_relation=dataRelation,go_to=1,speed=speed,appear_time=time).save()
                    start_exit.append(i)
                    continue
            if(frame_no - i.time > VIDEO_FPS):
                peoples.remove(i)



        for i in range(0,len(contours)):
            cnt = contours[i]
            contours_sorted[i] = (i,cv2.contourArea(cnt))
        contours_sorted = np.sort(contours_sorted, order='area')[::-1]

        moved_people = []
        for i in range(0,contours_sorted.shape[0]):
            #if area < cutoff go this frame analysis is done
            if(contours_sorted[i][1] < AREA_CUTOFF):
                break
            #distance between people and contour
            distance = np.empty(len(peoples))
            #biggest contour get more priority
            cnt = contours[contours_sorted[i][0]]
            #x,y of rect
            x,y,w,h = cv2.boundingRect(cnt)
            # 10,10 - 0,0 <  200 - 0 200
            
            #calc distance
            for j in range(0,len(peoples)):
                distance[j] = (peoples[j].position[0] - x) * (peoples[j].position[0] - x) + (peoples[j].position[1] - y) * (peoples[j].position[1] - y)
            #if no people don't argmin
            if(distance.shape[0] != 0):
                min_index = np.argmin(distance)
            #if no people or nearest contour is still far create new people
            if(len(peoples) - len(moved_people) == 0 or distance[min_index] > DISTANCE_CUTOFF * DISTANCE_CUTOFF):
                if((np.array((x,y)) - EXIT_POSITION < EXIT_CUTOFF).all() and (np.array((x,y)) - EXIT_POSITION > (0,0)).all()):
                    continue
                if((np.array((x,y)) - START_POSITION < START_CUTOFF).all() and (np.array((x,y)) - START_POSITION > (0,0)).all()):
                    continue
                
                people = Trackable((x,y),frame_no,cv2.contourArea(cnt))
                peoples.append(people)
                break
            else:
                people = peoples[min_index]
                people.move((x,y),frame_no,cv2.contourArea(cnt))
                moved_people.append(min_index)
            aspect_ratio = float(w)/h
            area = contours_sorted[i][1]

        for i in peoples:
            distance = np.empty(len(contours_sorted))
            value = np.empty(len(contours_sorted))
            area_diff = np.empty(len(contours_sorted))
            for j in range(0,len(contours_sorted)):
                cnt = contours[contours_sorted[j][0]]
                x,y,w,h = cv2.boundingRect(cnt)
                distance[j] = math.sqrt((i.position[0] - x) * (i.position[0] - x) + (i.position[1] - y) * (i.position[1] - y))
                area_diff[j] = math.fabs(i.area - cv2.contourArea(cnt))
                #print (distance[j],area_diff[j])
                value[j] = distance[j]+area_diff[j]
            if(distance.shape[0] != 0):
                min_index = np.argmin(value)
                if(math.fabs(distance[min_index]) > DISTANCE_CUTOFF):
                    continue
                cnt = contours[contours_sorted[min_index][0]]
                x,y,w,h =  cv2.boundingRect(cnt)
                i.move((x,y),frame_no,cv2.contourArea(cnt))
                # cv2.putText(fgmask,str(people.id), (int(people.position[0]),int(people.position[1])), cv2.FONT_HERSHEY_SIMPLEX, 2, DRAW_COLOR)
                # cv2.drawContours(fgmask, [cnt], 0, DRAW_COLOR, 3)

                
        #Comment this out for debug the video
        cv2.imshow('frame',fgmask)
        k = cv2.waitKey(25)
        if k == 27:
           break


        # print cap.get(0)/1000
    cap.release()
    cv2.destroyAllWindows()
    return

if __name__ == '__main__':
    path = "car3.mp4"
    process(path,{'cam': [{'top': 0, 'left': 0.25}, {'top': 0.8944, 'left': 7.3333}],'height':480,'width':854})