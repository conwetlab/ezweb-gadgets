#! /usr/bin/env python
# -*- coding: utf-8 -*-
import os
import sys

import tempfile
import shutil
import zipfile

from xml.dom.minidom import parse

import re

from urllib import pathname2url

#******************************************************************************
#******************************************************************************

class Error:
    def __init__(self, code):
        self.messages = {0:"Usage: pack_gadget [-nb] [-s pattern directory | directory1 ... directoryN]",
                         1:"Error: The gadget doesn't have template",
                         2:"Error: The gadget doesn't have html file",
                         3:"Error: The source code of the gadget could not be read",
                         4:"Error: Wgt package could not be copied to gadget directory",
                         5:"Error: The directory doesn't exist or isn't a directory"}
        self.code = code
    
    def __str__(self):
        return self.messages[self.code]

#******************************************************************************
#******************************************************************************

class WgtPackageUtils:
    def __init__(self):
        self.extension = ".wgt"

    # create a new widget package
    def create(self, folder, filename):
        zip_file = zipfile.ZipFile(filename + self.extension, 'w')
        self.addFolder(zip_file, folder)
        zip_file.close()

    # Add a folder to wgt file
    def addFolder(self, zip_file, folder):
        # check if folder is empty
        if len(os.listdir(folder)) == 0:
            zip_file.write(folder + "/")
            return

        for file in os.listdir(folder):
            full_path = os.path.normpath(os.path.join(folder, file))

            if os.path.isfile(full_path):
                zip_file.write(full_path)
            elif os.path.isdir(full_path):
                self.addFolder(zip_file, full_path)

#******************************************************************************
#******************************************************************************

class ConfigFile:
    def __init__(self, parserTemplate):
        self.file_name = "config.xml"
        self.id = parserTemplate.id
        self.name = parserTemplate.name
        self.vendor = parserTemplate.vendor
        self.version = parserTemplate.version
        self.file_content = """<?xml version="1.0" encoding="UTF-8"?>
<widget xmlns=\"http://www.w3.org/ns/widgets/\"
                id=\"%(id)s\"
                name=\"%(name)s\"
                vendor=\"%(vendor)s\"
                version=\"%(version)s\"/>
                """ % {"id":self.id, 
                       "name":self.name, 
                       "vendor":self.vendor,
                       "version":self.version}
        self.path = None
        
    # Write config.xml file in path
    def write(self, path):
	path = os.path.abspath(path)
        self.path = os.path.join(path, self.file_name)
        f = open(self.path, "w")
        f.write(self.file_content)
        f.close()
        
            
    def __str__(self):
        return self.file_content

#******************************************************************************
#******************************************************************************

class ParserTemplate:
    def __init__(self, config):
        self.name = None
        self.vendor = None
        self.version = None
        self.id = config.template
        self.config = config
        
    def __get_url_path_file__(self, path):
        for file in self.config.others_files:
            if path.find(pathname2url(file)):
                return pathname2url(file)
        
    # Parser template file
    def parse(self):
        if (self.config.template == None):
            raise Error(1)
        xmldoc = parse(os.path.join(self.config.path, self.config.template))
        
        # Get Name tag
        if xmldoc.getElementsByTagName("Name"):
            name = xmldoc.getElementsByTagName("Name")[0].firstChild.nodeValue 
            self.name = name.replace(" ", "_")
            
        # Get Vendor tag
        if xmldoc.getElementsByTagName("Vendor"):
            vendor = xmldoc.getElementsByTagName("Vendor")[0].firstChild.nodeValue
            self.vendor = vendor.replace(" ", "_")
            
        # Get Version tag
        if xmldoc.getElementsByTagName("Version"):
            version = xmldoc.getElementsByTagName("Version")[0].firstChild.nodeValue
            self.version = version
            
        if self.config.html == None:
            raise Error(2)
        
        xhtml = xmldoc.getElementsByTagName("XHTML")[0]
        href = xhtml.getAttribute("href")
        xhtml.setAttribute("href", pathname2url(self.config.html))

        # Set ImageURI tag
        if xmldoc.getElementsByTagName("ImageURI"):
            imageURI = xmldoc.getElementsByTagName("ImageURI")[0]
            imageURL = imageURI.firstChild.nodeValue
            imageURL = self.__get_url_path_file__(imageURL)
            imageURI.firstChild.replaceWholeText(imageURL)

        # Set iPhoneImageURI tag
        if xmldoc.getElementsByTagName("iPhoneImageURI"):
            iPhoneImageURI = xmldoc.getElementsByTagName("iPhoneImageURI")[0]
            iPhoneImageURL = iPhoneImageURI.firstChild.nodeValue
            iPhoneImageURL = self.__get_url_path_file__(iPhoneImageURL)
            iPhoneImageURI.firstChild.replaceWholeText(iPhoneImageURL)
        
        self.template = xmldoc.toxml()
        
    # Write template content into file
    def write(self, path=None):
        if (path == None):
            path = os.path.join(self.config.path, self.config.template)

        f = open(path, "w")
        f.write(self.template)
        f.close()
        
#******************************************************************************
#******************************************************************************

class ParserHtml:
    def __init__(self, config):
        self.config = config
        
        
    def parse(self, replace_base=False):
        if (self.config.html == None):
            raise Error(2)
        path = os.path.join(self.config.path, self.config.html)
        
        # Read HTML File
        f = open(path, "r")
        content = f.read()
        f.close()
        
        if replace_base:
            # Replace Base Tag by ""
            base = re.compile(r'<base.*?/>', re.I | re.S)
            content = base.sub('', content)
            base = re.compile(r'<base>.*</base>', re.I | re.S)
            content = base.sub('', content)
        
        self.xhtml = content
        
    def write(self, path=None):
        if (path == None):
            path = os.path.join(self.config.path, self.config.html)

        f = open(path, "w")
        f.write(self.xhtml)
        f.close()

#******************************************************************************
#******************************************************************************

class ConfigInfo:
    def __init__(self, path):
        # Path Gadget Folder
        self.html = None
        self.path = os.path.abspath(path)
        self.xml = []
        self.others_files = []
        # Order files by extension 
        self.__order_files__()
        # Get template path
        self.__get_template__()
        
    def _normalize_path(self, path):
        if path.startswith('/'):
            return path[1:]
        return path

    # Order files by extension
    def __order_files__(self):
        html = re.compile(r'.*htm[l]*$', re.I)
        xml = re.compile(r'.*xml$', re.I)
        for (dirpath, dirname, filenames) in os.walk(self.path):
            for filename in filenames:
                # Get relative path
                path = os.path.join(dirpath, filename)
                path = path.split(self.path)[1]
                path = self._normalize_path(path)
                if html.search(filename):
                    self.html = path
                elif xml.search(filename):
                    self.xml.append(path)
                else:
                    self.others_files.append(path)
    
    # Search template file
    def __get_template__(self):
        # Check if file has template tag
        exp = re.compile(r'<template.*</template>', re.I | re.S)
        for path in self.xml:
            f = open(os.path.join(self.path, path), "r")
            content = f.read()
            f.close()
            if exp.search(content):
                # Relative path
                self.template = path
                return
    
    # Replaces pattern by word void
    def replace(self, pattern):
        exp = re.compile(r'%s' % pattern, re.S)
        for filename in ([self.html] + self.xml + self.others_files):
            path = os.path.join(self.path, filename)
            # Read file
            f = open(path, "r")
            content = f.read()
            f.close()
            # Replace pattern by word void
            content = exp.sub("", content)
            # Write File
            f = open(path, "w")
            f.write(content)
            f.close()
            

#******************************************************************************
#******************************************************************************

class PackGadget:
    def __init__(self, path):
        # Check if the path is a directory
        if not os.path.isdir(path):
            raise Error(5)
        
        self.path = os.path.abspath(self._normalize_path(path))
        self.tmp = None
        self.tmpgadget = None
        self.pack = None
        
    def _normalize_path(self, path):
        path = os.path.normpath(path)
        if (path[-1] == '/'):
            return path[:-1]
        return path

    # Create tmp folder
    def tmp_dir(self):
        self.tmp = tempfile.mkdtemp()
        # Path to folder gadget in temporal folder
        self.tmpgadget = os.path.join(self.tmp, "src")
                
    # Move folder
    def move(self):
        # Check if src folder has read permissions
        if not os.access(self.path, os.R_OK):
            raise Error(3)
        
        shutil.copytree(self.path, self.tmpgadget, ignore=shutil.ignore_patterns('*~', '.*', "*.wgt"))
        
    # Remove temporal folder
    def rm_tmp_dir(self):
        shutil.rmtree(self.tmp)

    # Change work folder
    def change_working_folder(self, dir):
        os.chdir(dir)
        
    # Move wgt file into gadget folder
    def move_wgt(self):
        if ((self.pack == None) or (not os.access(self.path, os.W_OK))):
            raise Error(4)
        shutil.copy(self.pack+".wgt", self.path)
        
    # Pack gadget into zip file
    def pack_gadget(self, pattern=None, replace_base=False):
        # Create temporal folder
        self.tmp_dir()
        # Move gadget folder to temporal folder
        self.move()
        # Get Config Info
        config = ConfigInfo(self.tmpgadget)
        if pattern:
            config.replace(pattern)
        # Parser Html gadget and overwrite html file
        parserHtml = ParserHtml(config)
        parserHtml.parse(replace_base)
        parserHtml.write()

        # Parser Html gadget and overwrite template file
        parserTemplate = ParserTemplate(config)
        parserTemplate.parse()
        parserTemplate.write()

        # Write Config File
        configFile = ConfigFile(parserTemplate)
        configFile.write(self.tmpgadget)

        self.filename =  "%s_%s_%s" % (configFile.vendor, 
                                 configFile.name, 
                                 configFile.version)
        self.pack = os.path.join(self.tmp, self.filename)
        # Change directory
        self.change_working_folder(self.tmpgadget)
        # Pack gadget into zip file
        wgtHandler = WgtPackageUtils()
        wgtHandler.create("./", self.pack)
        # Copy pack into gadget folder
        self.move_wgt()
        # Remove temporal dir
        self.rm_tmp_dir()


#******************************************************************************
#******************************************************************************
try:
    newP = None
    replace_base = True 
    pattern = None
    parameters = sys.argv
    # Check arguments
    if (len(parameters) <= 1):
        raise Error(0)
    
    # Check if the user need help
    if parameters.count("--help") or parameters.count("-h"):
        raise Error(0)

    # Check if base tag should be replaced by ""
    if parameters.count("-nb") > 0:
        replace_base = False
        parameters.remove("-nb")

    # Check if pattern should be replaced by ""
    if parameters.count("-s") > 0:
       index = parameters.index("-s")
       pattern = parameters[index+1]
       # Remove flag -s and pattern
       parameters.remove("-s")
       parameters.remove(pattern)
       # Check parameters
       if (len(parameters) != 2):
           raise Error(0)

    # Pack elements
    for path in parameters[1:]:
        print "--------------------------------------------------------------------------------"
        print "Packing gadget ........ %s" % path
        newP = PackGadget(path)
        newP.pack_gadget(pattern, replace_base)
        print "New packed     ........ %s.wgt" % newP.filename
    print "--------------------------------------------------------------------------------"

except Error, e:
    print e
    if (e.code > 0):
        print "--------------------------------------------------------------------------------"
finally:
    if ((newP!=None) and (newP.tmp != None) and os.path.isdir(newP.tmp)):
        newP.rm_tmp_dir()
