import numpy as np
import cv2
import time
from people import People
import os
#static var
DISTANCE_CUTOFF = 20000
KERNEL_PIXEL = 5
BLUR_PIXEL = 3
DRAW_COLOR = (127,127,127)
AREA_CUTOFF = 8000
EXIT_CUTOFF = (20,20)
TIME_DIFF = 30
EXIT_POSITION = (230.0, 10.0)

def process(path):
    cap = cv2.VideoCapture(path)
    fgbg = cv2.BackgroundSubtractorMOG(history=2000, nmixtures=5, backgroundRatio=0.7)
    kernel = np.ones((KERNEL_PIXEL,KERNEL_PIXEL),np.uint8)
    kernel2 = np.ones((KERNEL_PIXEL,KERNEL_PIXEL),np.uint8)
    print fgbg
    peoples = []
    all_peoples = []
    frame_no = 0
    start = time.time()
    while(1):
        ret, frame = cap.read()
        frame_no += 1
        # reduce fps by 5 time
        if(frame_no % 5 != 0):
            continue
        if(frame == None):
            break
        height, width = frame.shape[:2]
        #print str(height)+" "+str(width)
        fgmask = fgbg.apply(frame)
        #noise
        fgmask = cv2.morphologyEx(fgmask, cv2.MORPH_OPEN, kernel)
        #blur
        fgmask = cv2.medianBlur(fgmask,BLUR_PIXEL)
        #connect contour
        fgmask = cv2.dilate(fgmask, kernel2 ,iterations = 4)
        #threshold
        ret3,thresh = cv2.threshold(fgmask,0,255,cv2.THRESH_BINARY+cv2.THRESH_OTSU)
        #find contour
        contours,hierarchy = cv2.findContours(thresh, mode=cv2.RETR_EXTERNAL, method=cv2.CHAIN_APPROX_SIMPLE)
        #sort contourSize
        contours_sorted = np.empty((len(contours)),dtype = [('index', int), ('area', float)])
        for i in peoples:
            #if on exit remove it
            #check position if near exit use short time check
            if((i.position - EXIT_POSITION < EXIT_CUTOFF).any()):
                i.save()
                peoples.remove(i)
                if(i.last_time - i.appear_time > 2):
                    all_peoples.append(i)
            #other use long time to track more
            if(frame_no - i.time > TIME_DIFF):
                i.save()
                peoples.remove(i)
                if(i.last_time - i.appear_time > TIME_DIFF):
                    all_peoples.append(i)

        for i in range(0,len(contours)):
            cnt = contours[i]
            contours_sorted[i] = (i,cv2.contourArea(cnt))
            #print contours_sorted[i]
        contours_sorted = np.sort(contours_sorted, order='area')[::-1]
        #find all in start area
        #regis as contour
        #find biggest one nearest one
        #
        #print "contours",contours_sorted
        for i in range(0,contours_sorted.shape[0]):
            #if area < cutoff go this frame analysis is done
            if(contours_sorted[i][1] < AREA_CUTOFF):
                break
            #distance between people and contour
            distance = np.empty(len(peoples))
            #biggest contour get more priority
            cnt = contours[contours_sorted[i][0]]
            #x,y of rect
            (x,y),(w,h),angle = cv2.minAreaRect(cnt)
            #calc distance
            for j in range(0,len(peoples)):
                distance[j] = (peoples[j].position[0] - x) * (peoples[j].position[0] - x) + (peoples[j].position[1] - y) * (peoples[j].position[1] - y)
            #if no people don't argmin
            if(distance.shape[0] != 0):
                min_index = np.argmin(distance)
            #if no people or nearest contour is still far create new people
            if(len(peoples) == 0 or distance[min_index] > DISTANCE_CUTOFF):
                people = People((x,y),frame_no)
                #print "create",people.id
                peoples.append(people)
            #
            else:
                people = peoples[min_index]
                people.move((x,y),frame_no)
            aspect_ratio = float(w)/h
            area = contours_sorted[i][1]
        for i in peoples:
            distance = np.empty(len(contours_sorted))
            for j in range(0,len(contours_sorted)):
                cnt = contours[contours_sorted[j][0]]
                (x,y),(w,h),angle = cv2.minAreaRect(cnt)
                distance[j] = (i.position[0] - x) * (i.position[0] - x) + (i.position[1] - y) * (i.position[1] - y)
            if(distance.shape[0] != 0):
                min_index = np.argmin(distance)
                if(distance[min_index] > DISTANCE_CUTOFF):
                    break
                cnt = contours[contours_sorted[min_index][0]]
                (x,y),(w,h),angle = cv2.minAreaRect(cnt)
                i.move((x,y),frame_no)
    
        print cap.get(0)/1000
    
    #TODO filter all_peoples

    out_path = os.path.dirname(path)+"/"+path.split("/")[-1].split(".")[0]+".dat"

    print "file save as : " +out_path
    f = open(out_path,"w")
    for i in all_peoples:
        f.write('{0} {1}\n'.format(i.appear_position-i.last_position,i.last_time-i.appear_time))
    f.close()
    cap.release()
    cv2.destroyAllWindows()
    return out_path