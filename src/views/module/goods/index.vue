<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label-width="90px" label="货物名称" prop="goodsName">
        <el-input
          v-model="queryParams.goodsName"
          placeholder="请输入货物名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label-width="90px" label="供货商" prop="supplierName">
        <el-select v-model="queryParams.supplierName" placeholder="请选择供货商" ref="userSelection">
          <el-option
            v-for="item in userList"
            :key="item.supplierId"
            :label="item.supplierName"
            :value="item.supplierName"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label-width="90px" label="存放仓库" prop="storeId">
        <el-select v-model="queryParams.storeId" placeholder="请选择存放仓库" ref="storeSelection">
          <el-option
            v-for="item in storeList"
            :key="item.storeId"
            :label="item.storeName"
            :value="item.storeId"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label-width="90px" label="存放分区" prop="goods_areaid">
        <el-select v-model="queryParams.goods_areaid" placeholder="请选择存放分区" ref="areaSelection" >
          <el-option
            v-if="item.storeId == queryParams.storeId"
            v-for="item in areaList"
            :key="item.areaId"
            :label="item.areaName"
            :value="item.areaId"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label-width="90px">
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['module:goods:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['module:goods:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['module:goods:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['module:goods:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="goodsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="货物名称" align="center" prop="goodsName" />

      <el-table-column label="货物图片" align="center" prop="bannerPic" >
        <template slot-scope="scope">
          <img :src="scope.row.picture?baseUrl+scope.row.picture:defaultPic" style="width: 150px;height: 100px;"/>
          <!--表示如果存在货物，那么显示row.pircure，如果不存在货物，那么显示默认图片-->
        </template>

      </el-table-column>
      <el-table-column label="供货商" align="center" prop="supplierName" />
      <el-table-column label="存放仓库" align="center" prop="storeName" />
      <el-table-column label="存放分区" align="center" prop="goods_area" />
      <el-table-column label="货物数量" align="center" prop="goodsNum" />
      <el-table-column label="货物类型" align="center" prop="goodsType" />
      <el-table-column label="最近入库时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['module:goods:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['module:goods:remove']"
          >删除</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
          >货物详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改货物对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="550px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label-width="115px"label="货物名称" prop="goodsName">
          <el-input v-model="form.goodsName" placeholder="请输入货物名称" />
        </el-form-item>

        <el-form-item label-width="115px"label="货物图片">
          <imageUpload v-model="form.picture"/>
        </el-form-item>

        <el-form-item label-width="115px"label="参考单价(元/kg)">
          <el-input v-model="form.price" placeholder="请输入参考单价(元/kg)" />
        </el-form-item>
        <el-form-item label-width="115px"label="货物产地">
          <el-input v-model="form.producer" placeholder="请输入货物产地" />
        </el-form-item>
        <el-form-item label-width="115px"label="供货商" prop="userId">
            <el-select v-model="form.userId" placeholder="请选择供货商" ref="userSelection">
                <el-option
                        v-for="item in userList"
                        :key="item.supplierId"
                        :label="item.supplierName"
                        :value="item.supplierId"
                ></el-option>
            </el-select>
        </el-form-item>


        <el-form-item label-width="115px"label="所属仓库" prop="storeId" >
          <el-select v-model="form.storeId" placeholder="请选择所属仓库" ref="storeSelection" >
            <el-option
              v-for="item in storeList"
              :key="item.storeName"
              :label="item.storeName"
              :value="item.storeId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="115px"label="所属分区" prop="goods_areaid">
          <el-select v-model="form.goods_areaid" placeholder="请选择所属分区" ref="areaSelection" >
            <el-option
              v-if="item.storeId == form.storeId"
              v-for="item in areaList"
              :key="item.areaId"
              :label="item.areaName"
              :value="item.areaId"
            ></el-option>
          </el-select>
        </el-form-item>


        <el-form-item label-width="115px"label="货物数量" prop="goodsNum">
          <el-input v-model="form.goodsNum" placeholder="请输入货物数量" />
        </el-form-item>
    <el-form-item label-width="115px"label="货物类型" prop="goodsType">
        <el-select v-model="form.goodsType" placeholder="请选择货物类型" ref="gtypeSelection">
            <el-option
                    v-for="item in gtypeList"
                    :key="item.gtypeName"
                    :label="item.gtypeName"
                    :value="item.gtypeName"
            ></el-option>
        </el-select>
    </el-form-item>
        <el-form-item label-width="115px"label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>

    </el-dialog>

    <el-dialog :title="title" :visible.sync="open2" width="550px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="115px">
        <el-form-item label="货物ID" prop="goodsId">
          <el-input v-model="form.goodsId" readonly/>
        </el-form-item>
        <el-form-item label="货物供应商" prop="supplierName">
          <el-input v-model="form.supplierName" readonly />
        </el-form-item>
        <el-form-item label="货物类型" prop="goodsType">
          <el-input v-model="form.goodsType" readonly />
        </el-form-item>
        <el-form-item label="货物名称" prop="goodsName">
          <el-input v-model="form.goodsName" readonly />
        </el-form-item>
        <el-form-item label="参考单价(元/kg)" prop="price">
          <el-input v-model="form.price" readonly />
        </el-form-item>
        <el-form-item label="货物图片" prop="picture">
          <img :src="form.picture?baseUrl+form.picture:defaultPic" style="width: 150px;height: 100px;"/>
        </el-form-item>
        <el-form-item label="货物产地" prop="producer">
          <el-input v-model="form.producer" readonly />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" readonly />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open2 = false">取 消</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
import {
        getstoreList,
        getuserList,
        getgtypeList,
    listGoods, getGoods, delGoods, addGoods, updateGoods,getareaList
} from "@/api/module/goods";
import { mapGetters } from 'vuex'

export default {
  name: "Goods",
  data() {
    return {
      baseUrl: process.env.VUE_APP_BASE_API,
      defaultPic: require("@/assets/images/defaultPic.png"),
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
      // 货物表格数据
      goodsList: [],
       storeList: [],
       userList: [],
       gtypeList: [],
      areaList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示另外一个弹出层
      open2:false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        goodsName: null,
        supplierName: null,
        storeName: null,
        storeId:null,
        gppds_areaid:null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        userId: [
          { required: true, message: "经销商不能为空", trigger: "blur" }
        ],
        storeId: [
          { required: true, message: "存放仓库不能为空", trigger: "blur" }
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
    this.getstoreInfo();
    this.getuserInfo();
    this.getgtypeInfo();
    this.getareaInfo();
  },
  methods: {

    handleDetail(row) {
      const goodsId = row.goodsId || this.ids
      getGoods(goodsId).then(response => {
        this.form = response.data;
        this.open2 = true;
        this.title = "货物详情";
      });
    },
    getstoreInfo(){
        getstoreList({}).then(response => {
            this.storeList = response.data;
        });
    },
    getareaInfo(){
      getareaList({}).then(response => {
        this.areaList = response.data;
      });
    },
    getuserInfo(){
        getuserList({}).then(response => {
            this.userList = response.data;
        });
    },
    getgtypeInfo(){
        getgtypeList({}).then(response => {
            this.gtypeList = response.data;
        });
    },
    /** 查询货物列表 */
    getList() {
      this.loading = true;
      // if(this.roles[0] == 'jingxiaoshang'){
      //   this.queryParams.userId = this.name.userId;
      // }
      if(this.roles[0] == 'cangguan'){
        this.queryParams.manager_id = this.name.userId;
      }
      listGoods(this.queryParams).then(response => {
        this.goodsList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    cance2l() {
      this.open2 = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        goodsId: null,
        goodsName: null,
        userId: null,
        supplierName: null,
        storeId: null,
        storeName: null,
        goodsNum: null,
        goodsType: null,
        createTime: null,
        updateTime: null,
        remark: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      listGoods(this.queryParams).then(response => {
        this.goodsList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.goodsId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加货物";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const goodsId = row.goodsId || this.ids
      getGoods(goodsId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改货物";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          // this.form.supplierName = this.$refs.userSelection.selectedLabel;;
          this.form.storeName = this.$refs.storeSelection.selectedLabel;;
          // this.form.goods_areaid = this.$refs.areaSelection.selectedLabel;;
          if (this.form.goodsId != null) {
            updateGoods(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addGoods(this.form).then(response => {
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
      const goodsIds = row.goodsId || this.ids;
      this.$modal.confirm('是否确认删除货物编号为"' + goodsIds + '"的数据项？').then(function() {
        return delGoods(goodsIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('module/goods/export', {
        ...this.queryParams
      }, `goods_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
