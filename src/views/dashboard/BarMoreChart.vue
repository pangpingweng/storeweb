<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
  import echarts from 'echarts'
  require('echarts/theme/macarons') // echarts theme
  import resize from './mixins/resize'
  const animationDuration = 6000
  const colors = ['#5793f3', '#d14a61', '#675bba'];
  const labelOption = {
    rotate: 90,
    align: 'left',
    verticalAlign: 'middle',
    position: 'insideBottom',
    distance: 15,
  };
  export default {
    mixins: [resize],
    props: {
      className: {
        type: String,
        default: 'chart'
      },
      width: {
        type: String,
        default: '900px'
      },
      height: {
        type: String,
        default: '500px'
      },
      autoResize: {
        type: Boolean,
        default: true
      },
      chartData: {
        type: Object,
        required: true
      }
    },
    watch: {
      chartData: {
        deep: true,
        handler(val) {
          this.setOptions(val)
        }
      }
    },
    data() {
      return {
        chart: null,
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.initData()
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
        that.initChart()
      },
      initChart() {
        this.chart = echarts.init(this.$el, 'macarons')
        this.setOptions(this.chartData)
      },
      setOptions({ xdataList, ydataList1, ydataList2 } = {}) {
        this.chart.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            data: ['缴费', '退费']
          },
          toolbox: {
            show: true,
            orient: 'vertical',
            left: 'right',
            top: 'center',
            feature: {
              mark: { show: true },
              dataView: { show: true, readOnly: false },
              magicType: { show: true, type: ['line', 'bar', 'stack'] },
              restore: { show: true },
              saveAsImage: { show: true }
            }
          },
          xAxis: [
            {
              type: 'category',
              axisTick: { show: false },
              data: xdataList
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: '缴费',
              type: 'bar',
              barGap: 0,
              label: labelOption,
              emphasis: {
                focus: 'series'
              },
              data: ydataList1
            },
            {
              name: '退费',
              type: 'bar',
              label: labelOption,
              emphasis: {
                focus: 'series'
              },
              data: ydataList2
            },
          ]
        })
      }
    }
  }
</script>
