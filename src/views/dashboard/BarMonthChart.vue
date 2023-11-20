<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
  import echarts from 'echarts'
  require('echarts/theme/macarons') // echarts theme
  import resize from './mixins/resize'
  const animationDuration = 6000
  const colors = ['#5470C6', '#91CC75', '#EE6666'];

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
      setOptions({ xdataList, ydataList1,ydataList2} = {}) {
        this.chart.setOption({
          color: colors,
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          grid: {
            right: '20%'
          },
          toolbox: {
            feature: {
              dataView: { show: true, readOnly: false },
              restore: { show: true },
              saveAsImage: { show: true }
            }
          },
          legend: {
            data: ['支出', '收入']
          },
          xAxis: [
            {
              type: 'category',
              axisTick: {
                alignWithLabel: true
              },
              data: xdataList
            }
          ],
          yAxis: [
            {
              type: 'value',
              name: '支出',
              position: 'right',
              alignTicks: true,
              axisLine: {
                show: true,
                lineStyle: {
                  color: colors[0]
                }
              },
              axisLabel: {
                formatter: '{value} 元'
              }
            },
            {
              type: 'value',
              name: '收入',
              position: 'left',
              alignTicks: true,
              axisLine: {
                show: true,
                lineStyle: {
                  color: colors[2]
                }
              },
              axisLabel: {
                formatter: '{value} 元'
              }
            }
          ],
          series: [
            {
              name: '支出',
              type: 'bar',
              data: ydataList1
            },
            {
              name: '收入',
              type: 'bar',
              yAxisIndex: 1,
              data: ydataList2
            }
          ]
        })
      }
    }
  }
</script>
