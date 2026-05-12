<!-- <template>
    <el-button plain @click="dialogVisible = true">
      Click to open the Dialog
    </el-button>
  
    <el-dialog
      v-model="dialogVisible"
      :title="defineDialogSptions.title"
      width="500"
      :before-close="handleClose"
    >
      <span>This is a message</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="dialogVisible = false">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>
  </template>
  
  <script lang="ts" setup>

    // defineProps 接受参数
   	const propsData =  defineProps<{
      dialogOption: any
    }>()

    interface defineDialogSptions {
			title: '弹框',
		}
     

    console.log(propsData.dialogOption, 'dialogOption')
  import { ref } from 'vue'
  import { ElMessageBox } from 'element-plus'
  
  const dialogVisible = ref(false)
  
  const handleClose = (done: () => void) => {
    ElMessageBox.confirm('Are you sure to close this dialog?')
      .then(() => {
        done()
      })
      .catch(() => {
        // catch error
      })
  }
  </script>
   -->