import tempfile
import shutil
import os
#import os.path

def createFiles(files):
    fileList = {}
    fileList["path"] = tempfile.mkdtemp() #(dir="/tmp")
    fileList["files"] = []
    for f in files:
        requestfile = files[f]
        try:
            newfile = file(os.path.join(fileList["path"], requestfile.name), "w")
            shutil.copyfileobj(requestfile, newfile)
            fileList["files"].append(newfile.name)
            requestfile.close()
            newfile.close()
        except Exception, e:
            requestfile.close()
    return fileList

def removeFiles(path):
    for root, dirs, files in os.walk(path, topdown=False):
       for name in files:
           os.remove(os.path.join(root, name))
       for name in dirs:
           os.rmdir(os.path.join(root, name))
       os.rmdir(path)
            
