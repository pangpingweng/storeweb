<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label-width="100px" label="出库编号" prop="stockName">
        <el-input
          v-model="queryParams.stockName"
          placeholder="请输入货物名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label-width="100px" label="经销商" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入经销商"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label-width="100px" label="出库仓库" prop="store_name">
        <el-input
          v-model="queryParams.storeName"
          placeholder="请输入仓库"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label-width="100px">
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
          v-hasPermi="['module:stock:add']"
        >申请出库
        </el-button>
      </el-col>
      <!--<el-col :span="1.5">-->
      <!--<el-button-->
      <!--type="primary"-->
      <!--plain-->
      <!--icon="el-icon-plus"-->
      <!--size="mini"-->
      <!--@click="handleAdd2"-->
      <!--v-hasPermi="['module:stock:add']"-->
      <!--&gt;申请出库-->
      <!--</el-button>-->
      <!--</el-col>-->
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['module:stock:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['module:stock:remove']"
        >删除
        </el-button>
      </el-col>
      <!--<el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['module:stock:export']"
        >导出</el-button>
      </el-col>-->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="stockList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="出库编号" align="center" prop="stockName"/>
      <el-table-column label="经销商" align="center" prop="userName"/>
      <el-table-column label="出库仓库" align="center" prop="storeName"/>
      <el-table-column label="出库状态" align="center" prop="stockStatus">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_stock_status" :value="scope.row.stockStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="出库类型" align="center" prop="stockType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_stock_type" :value="scope.row.stockType"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
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
            v-hasPermi="['module:stock:edit']"
            :disabled="scope.row.stockStatus === '审核通过' || scope.row.stockStatus === '审核未通过'"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['module:stock:remove']"
            :disabled="scope.row.stockStatus === '审核通过'"
          >删除
          </el-button>
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

    <!-- 添加或修改出库对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label-width="100px" label="所属经销商" prop="userId" v-if="roles[0] != 'jingxiaoshang' " >
          <el-select v-model="form.userId" placeholder="请选择经销商" ref="userSelection">
            <el-option
              v-if="item.roleName == '经销商'"
              v-for="item in userList"
              :key="item.userId"
              :label="item.nickName"
              :value="item.userId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="100px" label="所属仓库" prop="stockId">
          <el-select v-model="form.storeId" placeholder="请选择所属仓库" ref="storeSelection">
            <el-option
              v-for="item in storeList"
              :key="item.storeId"
              :label="item.storeName"
              :value="item.storeId"
            ></el-option>
          </el-select>
        </el-form-item>

        <!--<el-form-item label-width="100px" label="所属分区" prop="goods_areaid">-->
        <!--<el-select v-model="form.areaname" placeholder="请选择所属分区" ref="areaSelection">-->
        <!--<el-option-->
        <!--v-if="item.storeId == form.storeId"-->
        <!--v-for="item in areaList"-->
        <!--:key="item.areaName"-->
        <!--:label="item.areaName"-->
        <!--:value="item.areaName"-->
        <!--&gt;</el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->

        <el-form-item label-width="100px" label="出库状态" prop="stockStatus" v-if="roles[0] != 'jingxiaoshang' && form.stockId" >
          <el-select v-model="form.stockStatus" placeholder="请选择出库状态">
            <el-option
              v-for="dict in dict.type.sys_stock_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <!--<el-form-item label-width="100px" label="出库类型" prop="stockType" >-->
        <!--<el-select v-model="form.stockType" placeholder="请选择出库类型" >-->
        <!--<el-option-->
        <!--v-for="dict in dict.type.sys_stock_type"-->
        <!--v-if="(roles[0] != 'jingxiaoshang' && dict.value=='出库') || dict.value=='出库'"-->
        <!--:key="dict.value"-->
        <!--:label="dict.label"-->
        <!--:value="dict.value"-->
        <!--&gt;</el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <el-form-item label-width="100px" label="收货人电话" prop="gtype" >
        <el-input v-model="form.gtype" placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item label-width="100px" label="出货人地址" prop="remark"  >
        <el-input v-model="form.remark" placeholder="请输入出货人地址"/>
        </el-form-item>
        <el-form-item label-width="100px" label="货物清单" >
          <el-upload
            ref="upload"
            :limit="1"
            accept=".xlsx, .xls"
            :headers="upload.headers"
            :action="upload.url + '?updateSupport=' + upload.updateSupport"
            :disabled="upload.isUploading"
            :on-progress="handleFileUploadProgress"
            :on-success="handleFileSuccess"
            :auto-upload="true"
            drag
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip text-center" slot="tip">
              <span>仅允许导入xls、xlsx格式文件。</span>
              <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
                       @click="importTemplate">下载模板
              </el-link>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 员工导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
                   @click="importTemplate">下载模板
          </el-link>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    getuserList,
    getstoreList, gettypeList, getareaList,
    listStock, getStock, delStock, addStock, updateStock,getsupplierList
  } from '@/api/module/stock'
  import { mapGetters } from 'vuex'
  import { getToken } from '@/utils/auth'
  import Treeselect from '@riophae/vue-treeselect'
  import '@riophae/vue-treeselect/dist/vue-treeselect.css'

  export default {
    name: 'Stock',
    dicts: ['sys_stock_type', 'sys_stock_status'],
    data() {
      return {
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
        // 出库表格数据
        stockList: [],
        userList: [],
        supplierList:[],
        storeList: [],
        typeList: [],
        areaList: [],
        goodsList:[],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          stockName: null,
          userName: null,
          storeName: null,
          supplierName:null,
          stockType:'出库'
        },
        upload: {
          // 是否显示弹出层（员工导入）
          open: false,
          // 弹出层标题（员工导入）
          title: '',
          // 是否禁用上传
          isUploading: false,
          // 是否更新已经存在的员工数据
          updateSupport: 0,
          // 设置上传的请求头部
          headers: { Authorization: 'Bearer ' + getToken() },
          // 上传的地址
          url: process.env.VUE_APP_BASE_API + '/module/stock/importData'
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          userId: [
            { required: true, message: '经销商不能为空', trigger: 'blur' }
          ],
          storeId: [
            { required: true, message: '所属仓库不能为空', trigger: 'blur' }
          ],
          supplierId: [
            { required: true, message: '供货商不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    computed: {
      ...mapGetters([
        'roles',
        'name'
      ])
    },
    created() {
      this.getList()
      this.getuserInfo()
      this.getstoreInfo()
      //this.gettypeInfo();
      this.getareaInfo()
      this.getsupplierInfo()
    },
    mounted() {
      console.log(JSON.stringify(this.userList, null, 2));
      console.log("supplierList:", this.supplierList);
      console.log(JSON.stringify(this.supplierList[0]));
      console.log(JSON.stringify(this.supplierList, null, 2));
      console.log("我是个钩子函数")
    },
    methods: {
      /** 导入按钮操作 */

      handleImport() {
        this.upload.title = '货物清单导入'
        this.upload.open = true
      },
      /** 下载模板操作 */
      importTemplate() {
        this.download('module/stock/importTemplate', {}, `货物清单模板_${new Date().getTime()}.xlsx`)
      },
      // 文件上传中处理
      handleFileUploadProgress(event, file, fileList) {
        this.upload.isUploading = true;
      },
      // 文件上传成功处理
      handleFileSuccess(response, file, fileList) {
        //this.upload.open = false;
        this.upload.isUploading = false;
        this.$refs.upload.clearFiles();
        ////this.$alert(response.msg, "导入结果", { dangerouslyUseHTMLString: true });
        //this.getList();
        this.goodsList = response.data;
      },
      // 提交上传文件
      submitFileForm() {
        this.$refs.upload.submit();
      },
      getuserInfo() {
        getuserList({}).then(response => {
          this.userList = response.data
        })
      },
      getsupplierInfo() {
        getsupplierList({}).then(response => {
          this.supplierList = response.data
        })
      },
      getstoreInfo() {
        getstoreList({}).then(response => {
          this.storeList = response.data
        })
      },
      gettypeInfo() {
        gettypeList({}).then(response => {
          this.typeList = response.data
        })
      },
      getareaInfo() {
        getareaList({}).then(response => {
          this.areaList = response.data
        })
      },
      /** 查询出库列表 */
      getList() {
        this.loading = true
        if(this.roles[0] == 'jingxiaoshang'){
          this.queryParams.userId = this.name.userId;
        }
        if(this.roles[0] == 'cangguan'){
          this.queryParams.manager_id = this.name.userId;
        }
        this.queryParams.stockType = '出库'
        listStock(this.queryParams).then(response => {
          this.stockList = response.rows
          this.total = response.total
          this.loading = false
        })
      },
      // 取消按钮
      cancel() {
        this.open = false
        this.open2 = false
        this.reset()
      },
      // 表单重置
      reset() {
        this.form = {
          stockId: null,
          stockName: null,
          userId: null,
          userName: null,
          storeId: null,
          storeName: null,
          stockStatus: null,
          stockType: null,
          createTime: null,
          updateTime: null,
          remark: null
        }
        this.resetForm('form')
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.pageNum = 1
        this.getList()
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm('queryForm')
        this.handleQuery()
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.stockId)
        this.single = selection.length !== 1
        this.multiple = !selection.length
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset()
        this.open = true
        this.title = '添加出库'
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset()
        const stockId = row.stockId || this.ids
        getStock(stockId).then(response => {
          this.form = response.data
          this.open = true
          this.title = '修改出库'
        })
      },

      /** 提交按钮 */
      submitForm() {
        this.form.stockType = '出库';
        if(this.form.stockType=='出库'){
          this.$refs['form'].validate(valid => {
            if (valid) {
              this.form.storeName = this.$refs.storeSelection.selectedLabel
              if(this.roles[0] == 'jingxiaoshang'){
                this.form.userId = this.name.userId;
                this.form.userName = this.name.nickName;
              }else{
                this.form.userName = this.$refs.userSelection.selectedLabel
              }
              if (this.form.stockId != null) {
                updateStock(this.form).then(response => {
                  this.$modal.msgSuccess('修改成功')
                  this.open = false
                  this.getList()
                })
              } else {
                this.form.goodsList = this.goodsList;
                addStock(this.form).then(response => {
                  this.$modal.msgSuccess('新增成功')
                  this.open = false
                  this.getList()
                })
              }
            }
          })
        }else{
          this.$refs['form'].validate(valid => {
            if (valid) {
              this.form.storeName = this.$refs.storeSelection.selectedLabel
              //this.form.userId = this.$refs.supplierSelection.value
              this.form.userName = this.$refs.userSelection.selectedLabel
            }
            if (this.form.stockId != null) {
              updateStock(this.form).then(response => {
                this.$modal.msgSuccess('修改成功')
                this.open = false
                this.getList()
              })
            } else {
              this.form.goodsList = this.goodsList;
              addStock(this.form).then(response => {
                this.$modal.msgSuccess('新增成功')
                this.open = false
                this.getList()
              })
            }

          })
        }
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const stockIds = row.stockId || this.ids
        this.$modal.confirm('是否确认删除出库编号为"' + stockIds + '"的数据项？').then(function() {
          return delStock(stockIds)
        }).then(() => {
          this.getList()
          this.$modal.msgSuccess('删除成功')
        }).catch(() => {
        })
      },
      /** 导出按钮操作 */
      handleExport() {
        this.download('module/stock/export', {
          ...this.queryParams
        }, `stock_${new Date().getTime()}.xlsx`)
      }
    }
  }
</script>
