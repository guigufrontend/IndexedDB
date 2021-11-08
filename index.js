let db; //数据库对象

//打开数据库，没有就会新建，第二个参数为version
// 默认version 为1
const request = window.indexedDB.open('users');
request.onerror = function (event) {
    console.log('数据库打开报错');
};


request.onsuccess = function (event) {
  db = request.result;
  console.log('数据库打开成功');
};

// 版本变化会触发这个事件，包括从无到有
request.onupgradeneeded = function(event) {
    db = event.target.result;
    let objectStore;
    // 如果没有对应的表没有就新建
    if (!db.objectStoreNames.contains('users')) {
        // 新建一个对象存储（表），主键为username
        // 如果需要一个自增的键，可以使用{autoIncrement: true}
        objectStore = db.createObjectStore('users', { keyPath: 'username' });
        // 新建索引 索引名称 索引所在的属性 配置（该属性是否包含重复的值）
        objectStore.createIndex('email', 'email', { unique: true });
        objectStore.createIndex('age', 'age', { unique: false });
    }
}


function add() {
    // 新建一个事务 配置可以是readonly readwrite versionchange
    // 第一个参数说明可以访问哪些对象存储
    const transaction = db.transaction(['users'], 'readwrite')
    // 事务获取对象存储
    const objstore =  transaction.objectStore('users')
    // 如果已经有同名键的数据会报错
    const request = objstore.add({ username: 'zhangsan', age: 24, 'email': 'email1' });
  
    request.onsuccess = function (event) {
      console.log('数据写入成功');
    };
  
    request.onerror = function (event) {
      console.log('数据写入失败', event);
    }
  }
  


function read() {
    const transaction = db.transaction(['users']);
    const objectStore = transaction.objectStore('users');
    // 通过主键获取信息
    const request = objectStore.get('zhangsan');
 
    request.onerror = function(event) {
      console.log('事务失败');
    };
 
    request.onsuccess = function( event) {
        // 这里也可以使用event.target.result.xx
       if (request.result) {
         console.log('username: ' + request.result.username);
         console.log('Age: ' + request.result.age);
         console.log('Email: ' + request.result.email);
       } else {
         console.log('未获得数据记录');
       }
    };
 }


 function readAll() {
    const objectStore = db.transaction('users').objectStore('users');
     // 创建一个游标
     // 第一个参数可以是range对象，表示查询范围
     // 第二个参数是方向 默认 next ， 
     // nextunique 跳过重复记录
     // prev 向前移动
     // preunique 向前移动，避免重复，遇到重复跳过
     const request = objectStore.openCursor()

     request.onsuccess = function (event) {
        const cursor = event.target.result;
        // 如果游标存在说明还有下一行数据
        // 如果没有下一行数据了，游标为null
        // cursor 属性有
        // direction 方向（NEXT NEXTUNIQUE PREV PREVUNIQUE） 
        // key 对象的键
        // value 实际的对象
        // primaryKey 游标的键，可能是对象键也可能是索引键，看是通过什么查询的
       if (cursor) {
         console.log('key: ' + cursor.key);
         console.log('username: ' + cursor.value.username);
         console.log('Age: ' + cursor.value.age);
         console.log('Email: ' + cursor.value.email);
         cursor.continue();
      } else {
        console.log('没有更多数据了！');
      }
    };
  }
  


  function update() {
      // 同名键就修改值
      const request = db.transaction(['users'], 'readwrite')
      .objectStore('users')
      .put({  username: 'zhangsan', age: 35, email: 'email2' });
  
    request.onsuccess = function (event) {
      console.log('数据更新成功');
    };
  
    request.onerror = function (event) {
      console.log('数据更新失败');
    }
  }
  


  function remove() {
    const request = db.transaction(['users'], 'readwrite')
      .objectStore('users')
      .delete('zhangsan');
  
    request.onsuccess = function (event) {
      console.log('数据删除成功');
    };
  }
  


  function getDataByEmailIndexFromKey(){
    const objectStore = db.transaction(['users'], 'readwrite')
    .objectStore('users')
    // 获取名为emial的索引对象
    const emailIndex = objectStore.index('email')

    //使用索引获取值
    const request = emailIndex.get('email1');

    request.onsuccess = function (e) {
        const result = e.target.result;
      if (result) {
        console.log('username: ' + result.username);
        console.log('Age: ' + result.age);
        console.log('Email: ' + result.email);

      } else {
        console.log('未获得数据记录');
      }
    }
  }

  function getDataByEmailIndexFromCursor(){
    const objectStore = db.transaction(['users'], 'readwrite')
    .objectStore('users')
    // 获取名为emial的索引对象
    const emailIndex = objectStore.index('email')

    //使用索引获取值
    const request = emailIndex.openCursor();

    request.onsuccess = function (e) {
        const cursor = e.target.result;
      if (cursor) {
        console.log('username: ' + cursor.value.username);
        console.log('Age: ' + cursor.value.age);
        console.log('Email: ' + cursor.value.email);

      } else {
        console.log('未获得数据记录');
      }
    }
  }

  function getDataByEmailIndexReturnPrimaryKey(){
    const objectStore = db.transaction(['users'], 'readwrite')
    .objectStore('users')
    // 获取名为emial的索引对象
    const emailIndex = objectStore.index('email')

    //使用索引获取值
    const request = emailIndex.openKeyCursor();

    request.onsuccess = function (e) {
        const cursor = e.target.result;
      if (cursor) {
        console.log('key: ' +  cursor.key);
        console.log('primaryKey: ' +  cursor.primaryKey);
      } else {
        console.log('未获得数据记录');
      }
    }
  }



  function getDataByCursor(){
    const objectStore = db.transaction(['users'], 'readwrite')
    .objectStore('users')

    //创建游标范围,只获取key为zhangsan的值
    const onlyRange = IDBKeyRange.only('zhangsan')

    // 第二个参数代表从key代表的记录后面或前面开始查询
    // 创建游标范围,定义结果集的下限,不包含 zhangsan
    const lowerRange = IDBKeyRange.lowerBound('zhangsan', true)
    //  创建游标范围,定义结果集的上限 包含zhangsan
    const upperRange = IDBKeyRange.upperBound('zhangsan')
    // 定义范围 不包含 zhangsan 包含 李四
    const range = IDBKeyRange.bound('zhangsan', '李四', true, false)

    // 把范围传给cursor，可以通过cursor查询
    const request = objectStore.openCursor(range)

    request.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
          console.log('key: ' + cursor.key);
          console.log('username: ' + cursor.value.username);
          console.log('Age: ' + cursor.value.age);
          console.log('Email: ' + cursor.value.email);
          cursor.continue();
       } else {
         console.log('没有更多数据了！');
       }
     };
  }
