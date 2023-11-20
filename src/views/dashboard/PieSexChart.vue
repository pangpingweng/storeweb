<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
import {
  listStudent
} from "@/api/system/user";

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '400px'
    }
  },
  data() {
    return {
      chart: null,
      xdataList:['男','女'],
      ydataList:[]
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initData();
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initData(){
      let that = this;
      listStudent({}).then(response => {
        let typeList = response.rows;
        let manNum = 0;
        let womanNum = 0;
        for(let i=0;i<typeList.length;i++){
          if(typeList[i].sex == '0'){
            manNum ++;
          }else{
            womanNum ++;
          }
        }
        that.ydataList.push({'name':'男','value':manNum},{'name':'女','value':womanNum});
        that.initChart()

      });
    },
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')

      this.chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: this.xdataList
        },
        series: [
          {
            name: '男女比例',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 95],
            center: ['50%', '38%'],
            data: this.ydataList,
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    }
  }
}
</script>
