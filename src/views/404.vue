<template>
<div>
 <img src="../assets//404.png" alt="" style="margin-left: 325px" >
  <div>
    <el-button type="primary" style="margin-left: 700px ;height: 60px;font-size: 20px" @click="router.push('/manager/home')">返回主页</el-button>
  </div>
</div>
</template>

<script setup>

import router from "@/router/index.js";
</script>