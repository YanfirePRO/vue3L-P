import wjBleAPI from '../wjBle/WJBleAPI.js'
import wjUtils from '../wjBle/WJUtils.js'
var deviceID,timeID;
Page({
  data: {
  },
  //扫描连接
  scanConnectBT: function() {
    var that = this;
    wjBleAPI.connectDevice(function(res) {
      deviceID = res.serviceData.dataBuff;
      console.log('连接结果：', res);
      that.setData({ msg: deviceID })
    },
      function(res_0) {
        console.log('监听结果：', res_0);
        that.setData({ msg: res_0.serviceInfo });
      })
  },
  //连接
  connectBT: function() {
    var that = this;
    // 开始扫描FEE7设备
    var foundDevices = [];
    my.closeBluetoothAdapter();
    my.openBluetoothAdapter({
      success: (res) => {
        my.startBluetoothDevicesDiscovery({
          services: [],
          success: function(res) {
            //扫描结果的监听
            my.onBluetoothDeviceFound(function(res) {
              for (let i = 0; i < res.devices.length; i++) {
                let isHave = false
                for (let j = 0; j < foundDevices.length; j++) {
                  if (res.devices[i].deviceId == foundDevices[j].deviceId) {
                    isHave = true
                    break
                  }
                }
                var name = res.devices[i]['name'];
                console.log("connectedDeviceName", name);
                if (isHave == false && name != '' && name != undefined) {
                  foundDevices.push(res.devices[i])
                  if (name.indexOf('WJ') != -1 || name.indexOf('WanJi') != -1) {
                    my.offBluetoothDeviceFound();
                    var connectedDeviceId = res.devices[i]['deviceId'];
                    var device = {};
                    device.device_name = name;
                    device.device_no = connectedDeviceId;
                    //停止扫描，开始连接
                    my.stopBluetoothDevicesDiscovery({
                      success: function(res) {
                        console.log("停止扫描，开始连接")
                        if (timeID != null) {
                          clearTimeout(timeID);
                          timeID = null;
                        }
                        wjBleAPI.connectDevice2(device,
                          function(res) {
                            that.setData({ msg: "连接结果：" + res.serviceInfo });
                          },
                          function(res) {
                            that.setData({ msg: "监听结果：" + res.serviceInfo });
                          });
                      }
                    });
                    break
                  }
                }
              }
            });
          },
          fail: function(res) {
            console.log('scanerror:' + res)
          }
        });
        timeID = setTimeout(function() {
          my.stopBluetoothDevicesDiscovery();
          my.offBluetoothDeviceFound();
          my.closeBluetoothAdapter();
          console.log('scan timeout')
        }, 5000);
      },
      fail: function(res) {
        console.log('openadapter:' + res)
      }
    });
  },
  //断开连接
  disconnectBT: function() {
    var that = this;
    wjBleAPI.disconnectDevice(function(res) {
      console.log('断开结果：', res);
      that.setData({ msg: res.serviceInfo });
    })
  },
  //设备信息
  getDeviceInfoBT: function() {
    var that = this;
    wjBleAPI.getDeviceInfo('C0', function(res) {
      console.log('设备信息', res)
      that.setData({ msg: res.serviceInfo });
    })
  },
  
  //透传读卡
  transReadCardBT: function() {
    var that = this;
    let cmdType = '',
      channel = '';
    let CMD_TYPE = wjUtils.getCMD_TYPE();
    if (CMD_TYPE == 0) { 
      cmdType = '10'
      channel = '82';
    } else if (CMD_TYPE == 1) {
      cmdType = '00';
      channel = 'A3';
    }
    wjBleAPI.transCmd('010700A40000021001020500B095002B0305805C000204', cmdType, channel, function(res) {
      console.log('transReadCard:', res);
      that.setData({ msg: res.serviceInfo });
    })
  },
  //透传读卡
  transReadCardArrayBT: function() {
    var that = this;
    let cmdType = '',
      channel = '';
    let CMD_TYPE = wjUtils.getCMD_TYPE();
    if (CMD_TYPE == 0) {
      cmdType = '10'
      channel = '82';
    } else if (CMD_TYPE == 1) {
      cmdType = '00';
      channel = 'A3';
    }
    let reqArray = ['010700A40000023F00', '010700A40000021001', '010500B095002B', '0105805C000204', '010700A40000023F00', '010500B0960037'];
    wjBleAPI.transCmdArray(reqArray, cmdType, channel, function(res) {
      console.log('transReadCardArray:', res);
      that.setData({ msg: res.serviceInfo });
    })
  },
  transReadSYSArrayBT: function() {
    var that = this;
    let cmdType = '',
      channel = '';
    let CMD_TYPE = wjUtils.getCMD_TYPE();
    if (CMD_TYPE == 0) {
      cmdType = '20'
      channel = '82';
    } else if (CMD_TYPE == 1) {
      cmdType = '00';
      channel = 'A4';
    }
    let reqArray = ['010700A40000023F00', '010500B0810063', '010500B081001B'];
    wjBleAPI.transCmdArray(reqArray, cmdType, channel, function(res) {
      console.log('transReadSYSArray:', res);
      that.setData({ msg: res.serviceInfo });
    });
  },
  //透传读系统信息
  transReadSYSBT: function() {
    var that = this;
    let cmdType = '',
      channel = '';
    let CMD_TYPE = wjUtils.getCMD_TYPE();
    if (CMD_TYPE == 0) {
      cmdType = '20'
      channel = '82';
    } else if (CMD_TYPE == 1) {
      cmdType = '00';
      channel = 'A4';
    }
    wjBleAPI.transCmd('010700A40000023F00020500B0810063', cmdType, channel, function(res) {
      console.log('transReadSYS:', res);
      that.setData({ msg: res.serviceInfo });
    })
  },
  
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: 'My App',
      desc: 'My App description',
      path: 'pages/index/index',
    };
  },
});
