<template>
  <div class="container">
    <img class="logo" src="@/assets/images/Logo.svg">
    <button>
      BECOME A CONTENT CREATOR
    </button>
    <button>
      WRITE AN UPDATE
    </button>
  </div>
</template>

<style scoped>

.container {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 42px;
    gap: 20px;
}

.logo {
    width: 90px;
    height: 20px;
    background: #FFFFFF;
    flex: none;
    order: 0;
    flex-grow: 0;
}

.container button:hover {
    cursor: pointer;
    border: 1px solid #ffffff;
}

.container button  {
    font-size: 10px;
    font-weight: 600;
    line-height: 12px;
    letter-spacing: 0.04em;
    color: white;
    height: 20px;
    align-items: center;
    background: transparent;
    border: 1px solid #BDD5EA;
    border-radius: 3px;
}
</style>