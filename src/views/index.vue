<template>
  <div class="app-container home" >

    <div class="w">
      <el-carousel height="480dpx">
        <el-carousel-item v-for="(item, index) in list_img" :key="index">
          <h3 class="small">
            <img :src="item.url" alt />
          </h3>
        </el-carousel-item>
      </el-carousel>
    </div>

    <el-row :gutter="20">
      <el-col :sm="24" :lg="12" style="padding-left: 20px">
        <h2>{{ title }}</h2>
        <p>
          欢迎进入{{ title }}
        </p>
        <p>

        </p>
      </el-col>
    </el-row>




    <!--<el-divider />-->

    <!--<panel-group  />-->


    <!--<el-row :gutter="24">-->
    <!--<el-col :xs="24" :sm="24" :md="12" :lg="16">-->
    <!--<el-table-->
    <!--:data="tableData"-->
    <!--border-->
    <!--style="width: 100%">-->
    <!--<el-table-column-->
    <!--prop="courseName"-->
    <!--label="课程名称"-->
    <!--&gt;-->
    <!--</el-table-column>-->
    <!--<el-table-column-->
    <!--prop="currScore"-->
    <!--label="已得学分"-->
    <!--&gt;</el-table-column>-->

    <!--<el-table-column-->
    <!--prop="courseScore"-->
    <!--label="总学分">-->
    <!--</el-table-column>-->
    <!--</el-table>-->
    <!--</el-col>-->

    <!--</el-row>-->





  </div>
</template>

<script>
  import PanelGroup from './dashboard/PanelGroup'
  // import {
  //   scoreList
  // } from "@/api/module/result";
  import { mapGetters } from 'vuex'
  export default {
    name: "Index",
    components: {
      PanelGroup,
    },
    data() {
      return {
        // 版本号
        version: "1.0.1",
        title: process.env.VUE_APP_TITLE,
        voucher:null,
        tableData:null,
        repair:null,
        queryParams: {
          pageNum: 1,
          pageSize: 10,
        },
        list_img: [
          { url: require('../assets/images/1.jpg') },
          { url: require('../assets/images/2.jpg') },
          { url: require('../assets/images/3.jpg') },
        ],
      };
    },
    computed: {
      ...mapGetters([
        'roles',
        'name',
      ]),
    },
    created() {
      //this.getList();
    },
    methods: {
      goTarget(href) {
        window.open(href, "_blank");
      },
      getList() {
        this.queryParams.userId = this.name.userId;
        scoreList(this.queryParams).then(response => {
          let list = response.rows;
          this.tableData = [];
          list.forEach((elem, index) => {
            let result = {
              'courseName':elem.courseName,
              'courseScore':elem.courseScore,
              'currScore':elem.status=='1'?elem.courseScore:"0",
            }
            this.tableData.push(result)
          });
          console.log(this.tableData);
        });
      },
    },
  };
</script>

<style scoped lang="scss">
  .home {
    blockquote {
      padding: 10px 20px;
      margin: 0 0 20px;
      font-size: 17.5px;
      border-left: 5px solid #eee;
    }
    hr {
      margin-top: 20px;
      margin-bottom: 20px;
      border: 0;
      border-top: 1px solid #eee;
    }
    .col-item {
      margin-bottom: 20px;
    }

    ul {
      padding: 0;
      margin: 0;
    }

    font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 13px;
    color: #676a6c;
    overflow-x: hidden;

    ul {
      list-style-type: none;
    }

    h4 {
      margin-top: 0px;
    }

    h2 {
      margin-top: 10px;
      font-size: 26px;
      font-weight: 100;
    }

    p {
      margin-top: 10px;

      b {
        font-weight: 700;
      }
    }

    .update-log {
      ol {
        display: block;
        list-style-type: decimal;
        margin-block-start: 1em;
        margin-block-end: 1em;
        margin-inline-start: 0;
        margin-inline-end: 0;
        padding-inline-start: 40px;
      }
    }
  }


  .w {
    margin: 0 auto;
    width: 1226px;
  }

  .el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 1;
    line-height: 300px;
    margin: 0;
    text-align: center;
  }

  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }

  .el-carousel__item:nth-child(2n + 1) {
    background-color: #d3dce6;
  }

  .small img {
    width: 100%;
    height: 100%;
  }

  .el-carousel__container {
    width: 1226px;
    height: 460px;
  }
</style>

