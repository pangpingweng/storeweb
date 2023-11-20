<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
  import echarts from 'echarts'
  require('echarts/theme/macarons') // echarts theme
  import resize from './mixins/resize'
  const animationDuration = 6000
  const colors = ['#5793f3', '#d14a61', '#675bba'];

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
        default: '300px'
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
      setOptions({ xdataList, ydataList, hdataList, jdataList } = {}) {
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
              dataView: {show: true, readOnly: false},
              restore: {show: true},
              saveAsImage: {show: true}
            }
          },
          legend: {
            data: xdataList
          },
          xAxis: [
            {
              type: 'category',
              axisTick: {
                alignWithLabel: true
              },
              data: ydataList
            }
          ],
          yAxis: [
            {
              type: 'value',
              name: '回款数量',
              position: 'left',
              axisLine: {
                lineStyle: {
                  color: colors[0]
                }
              },
              axisLabel: {
                formatter: '{value}'
              }
            },
            {
              type: 'value',
              name: '回款金额',
              position: 'right',
              axisLine: {
                lineStyle: {
                  color: colors[1]
                }
              },
              axisLabel: {
                formatter: '{value} 元'
              }
            }
          ],
          series: [
            {
              name: '回款数量',
              type: 'bar',
              data: hdataList
            },
            {
              name: '回款金额',
              type: 'bar',
              yAxisIndex: 1,
              data: jdataList
            },
          ]
        })
      }
    }
  }
</script>
