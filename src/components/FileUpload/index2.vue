<template>
  <div>
  <el-upload
    class="avatar-uploader"
    :action="uploadVideoUrl"
    :on-progress="uploadVideoProcess"
    :on-success="handleVideoSuccess"
    :before-upload="beforeUploadVideo"
    :show-file-list="false"
    :headers="headers"
  >
    <video
      v-if="videoForm.showVideoPath != '' && !videoFlag"
      v-bind:src="videoForm.showVideoPath"
      class="avatar video-avatar"
      controls="controls"
    >
      您的浏览器不支持视频播放
    </video>
    <i
      v-else-if="videoForm.showVideoPath == '' && !videoFlag"
      class="el-icon-plus avatar-uploader-icon"
    ></i>
    <el-progress
      v-if="videoFlag == true"
      type="circle"
      v-bind:percentage="videoUploadPercent"
      style="margin-top: 7px"
    ></el-progress>
  </el-upload>
  <!--&lt;!&ndash; 上传提示 &ndash;&gt;-->
  <div class="el-upload__tip" slot="tip" >
    请上传
    <template> 大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b> </template>
    <template > 格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b> </template>
    的文件
  </div>
  </div>
</template>

<script>
  import { getToken } from "@/utils/auth";
  export default {
    props: {
      value: [String, Object, Array],
      // 图片数量限制
      limit: {
        type: Number,
        default: 1,
      },
      // 大小限制(MB)
      fileSize: {
        type: Number,
        default: 1024,
      },
      // 文件类型, 例如['png', 'jpg', 'jpeg']
      fileType: {
        type: Array,
        default: () => ["mp4", "ogg", "flv", "avi", "wmv","mov"],
      },
      // 是否显示提示
      isShowTip: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        baseUrl: process.env.VUE_APP_BASE_API,
        uploadVideoUrl: process.env.VUE_APP_BASE_API + "/common/upload",
        headers: {
          Authorization: "Bearer " + getToken(),
        },
        videoFlag: false,
        //是否显示进度条
        videoUploadPercent: "",
        //进度条的进度，
        isShowUploadVideo: false,
        //显示上传按钮
        videoForm: {
          showVideoPath: "", //回显的变量
        },
      };
    },
    watch: {
      value: {
        handler(val) {
          if (val) {
            // 首先将值转为数组
            const list = Array.isArray(val) ? val : this.value.split(',');
            // 然后将数组转为对象数组
            this.fileList = list.map(item => {
              if (typeof item === "string") {
                if (item.indexOf(this.baseUrl) === -1) {
                  item = { name: item, url:  item };
                } else {
                  item = { name: item, url: item };
                }
              }
              return item;
            });
          } else {
            this.fileList = [];
            return [];
          }
        },
        deep: true,
        immediate: true
      }
    },
    methods: {
      //上传前回调
      beforeUploadVideo(file) {
        var fileSize = file.size / 1024 / 1024 < 1024; //控制大小  修改50的值即可
        if (
          [
            "video/mp4",
            "video/ogg",
            "video/flv",
            "video/avi",
            "video/wmv",
            "video/rmvb",
            "video/mov",
          ].indexOf(file.type) == -1 //控制格式
        ) {
          layer.msg("请上传正确的视频格式");
          return false;
        }
        if (!fileSize) {
          layer.msg("视频大小不能超过50MB");
          return false;
        }
        this.isShowUploadVideo = false;
      },
      //进度条
      uploadVideoProcess(event, file, fileList) {
        //注意在data中添加对应的变量名
        this.videoFlag = true;
        this.videoUploadPercent = file.percentage.toFixed(0) * 1;
      },
      //上传成功回调
      handleVideoSuccess(res, file) {
        this.isShowUploadVideo = true;
        this.videoFlag = false;
        this.videoUploadPercent = 0;
        console.log(res);
        this.videoForm.showVideoPath = res.url;
      },
    },
  };
</script>

<style scoped>
  .avatar-uploader-icon {
    border: 1px dashed #d9d9d9 !important;
  }
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9 !important;
    border-radius: 6px !important;
    position: relative !important;
    overflow: hidden !important;
  }
  .avatar-uploader .el-upload:hover {
    border: 1px dashed #d9d9d9 !important;
    border-color: #409eff;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 300px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 300px;
    height: 178px;
    display: block;
  }
</style>

