<template>
  <div class="app-container">


    <el-tabs type="border-card">
      <el-tab-pane label="按天统计">
        <el-table v-loading="loading" :data="dayList" >
          <el-table-column label="出入库日期" align="center" prop="goodsType" />
          <el-table-column label="货物名称" align="center" prop="goodsName" />
          <el-table-column label="货物数量" align="center" prop="goodsNum" />
          <el-table-column label="出入库类型" align="center" prop="goods_stocktype" />
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="按周统计">
        <el-table v-loading="loading" :data="weekList" >
          <el-table-column label="出入库周" align="center" prop="goodsType" />
          <el-table-column label="货物名称" align="center" prop="goodsName" />
          <el-table-column label="货物数量" align="center" prop="goodsNum" />
          <el-table-column label="出入库类型" align="center" prop="goods_stocktype" />
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="按月统计">
        <el-table v-loading="loading" :data="monthList" >
          <el-table-column label="出入库月" align="center" prop="goodsType" />
          <el-table-column label="货物名称" align="center" prop="goodsName" />
          <el-table-column label="货物数量" align="center" prop="goodsNum" />
          <el-table-column label="出入库类型" align="center" prop="goods_stocktype" />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

  </div>
</template>

<script>
import {
        getgoodsList,listDay,listWeek,listMonth,
  getstockList,gettypeList,
    listDetail, getDetail, delDetail, addDetail, updateDetail
} from "@/api/module/detail";
import { mapGetters } from 'vuex'

export default {
  name: "Detail",
  data() {
    return {
      dayList:[],
      weekList:[],
      monthList:[],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 日期范围
      dateRange: [],
      // 出入库明细表格数据
      detailList: [],
       goodsList: [],
       stockList: [],
      typeList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        goodsName: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        stockId: [
          { required: true, message: "出入库不能为空", trigger: "blur" }
        ],
        goodsId: [
          { required: true, message: "货物名称不能为空", trigger: "blur" }
        ],
      }
    };
  },
  computed: {
    ...mapGetters([
        'roles',
        'name',
    ]),
  },
  created() {
    this.getList();
  },
  methods: {

    /** 查询出入库明细列表 */
    getList() {
      this.loading = true;
      listDay({}).then(response => {
        this.dayList = response.data;
        this.total =  this.dayList.length;
        this.loading = false;
      });
      listWeek({}).then(response => {
        this.weekList = response.data;
        this.total = this.weekList.length;
        this.loading = false;
      });
      listMonth({}).then(response => {
        this.monthList = response.data;
        this.total = this.monthList.length;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        detailId: null,
        stockId: null,
        goodsId: null,
        goodsName: null,
        goodsNum: null,
        goodsType: null,
        createTime: null,
        remark: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.detailId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加出入库明细";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const detailId = row.detailId || this.ids
      getDetail(detailId).then(response => {
        this.form = response.data;

        this.open = true;
        this.title = "修改出入库明细";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
//this.form.stockName = this.$refs.stockSelection.selectedLabel;;
//this.form.goodsName = this.$refs.goodsSelection.selectedLabel;;

          if (this.form.detailId != null) {
            updateDetail(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addDetail(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const detailIds = row.detailId || this.ids;
      this.$modal.confirm('是否确认删除出入库明细编号为"' + detailIds + '"的数据项？').then(function() {
        return delDetail(detailIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('module/detail/export', {
        ...this.queryParams
      }, `detail_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
