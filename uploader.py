# requires arduino-cli.exe and template.c to be in same folder
import re
import os
import subprocess
import shutil

if not os.path.isfile('./arduino-cli.yaml'):  # initialize config on first run
    print('Config file not found, performing first time setup...')
    with open('arduino-cli.yaml', 'w') as configfile:
        configfile.write('board_manager:\n  additional_urls:\n    - https://dl.espressif.com/dl/package_esp32_index.json')
        configfile.close()
    subprocess.run(['arduino-cli', 'core', 'update-index', '--config-file', 'arduino-cli.yaml'],shell = True) #update config from new file, installs ESP32 libraries
    subprocess.run(['arduino-cli', 'core', 'install', 'esp32:esp32'],shell = True)
    subprocess.run(['arduino-cli', 'lib', 'install', 'ArduinoJson'],shell=True) #install json library

if os.path.isdir("./plug_send_replaced"): #delete sketch folder left over if a previous run failed
    shutil.rmtree("./plug_send_replaced")

process = subprocess.Popen(['arduino-cli', 'board', 'list'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)  #find COM number in board list
std_out_val, std_err_val = process.communicate()
port_loc = re.search(r'COM\d+', str(std_out_val)) # this only works if there's exactly one serial port connected
if port_loc is not None:
    serial_port = str(std_out_val)[port_loc.start():port_loc.end()]
    print(std_out_val)
    print(serial_port)
else:
    print('No serial ports detected!')
    quit()

node_ID = input('Enter node name or leave blank to use MAC address: ')
wifi_ssid = input('Enter Wifi SSID: ')
wifi_pass = input('Enter WiFi password or leave blank: ')
csc_id = input('Enter CSC ID: ')
building_name = input('Enter building name: ')
machine_id = input('Enter \'w\' for washer or \'d\' for dryer: ')

with open('template.c','r') as file:
    filedata = file.read()


if node_ID != '': #If ID is blank, use the device's MAC address
    filedata = re.sub('NODE_ID','\"{}\"'.format(node_ID), filedata)
else:
    filedata = re.sub('NODE_ID', 'WiFi.macAddress()', filedata)
    print('Inserting MAC address')

filedata = re.sub('USER_SSID', '\"{}\"'.format(wifi_ssid), filedata) #insert SSID
if wifi_pass == '':
    filedata = re.sub('USER_PASSWORD', 'NULL', filedata) #if password is blank, insert NULL
else:
    filedata = re.sub('USER_PASSWORD', '\"{}\"'.format(wifi_pass), filedata) #otherwise, insert password

filedata = re.sub('CSC_ID', '\"{}\"'.format(csc_id), filedata) #insert CSC ID
filedata = re.sub('BUILDING_NAME', '\"{}\"'.format(building_name), filedata) #insert building name
if machine_id == 'w':
    filedata = re.sub('MACHINE_TYPE', '\"Washer\"', filedata) #if w, insert "Washer"
elif machine_id == 'd':
    filedata = re.sub('MACHINE_TYPE', '\"Dryer\"', filedata) #if d, insert "Dryer"
else:
    print('Invalid machine type')
    exit()

#print(filedata)

subprocess.run(['arduino-cli', 'sketch', 'new', 'plug_send_replaced'],shell = True) # create new sketch
with open('plug_send_replaced/plug_send_replaced.ino','w+') as outfile: # paste code into sketch, with ID/SSID/password inserted
    outfile.write(filedata)
print('Compiling...')

subprocess.run(['arduino-cli', 'compile', '--fqbn', 'esp32:esp32:esp32doit-devkit-v1', 'plug_send_replaced'],shell=True) # compile
print('Done compiling')
input('Press Enter to upload') # Wait for input before uploading, so the user can plug in the programmer
print('Starting upload...')
subprocess.run(['arduino-cli', 'upload', '-p', serial_port, '--fqbn', 'esp32:esp32:esp32doit-devkit-v1', 'plug_send_replaced'],shell = True) # upload
print('Uploaded')
shutil.rmtree('plug_send_replaced')
