# change-majar
## 1、初始化云环境
	（1）创建数据库表
		student_info
      仅创建表
		course_info导入
      csv导入，在data目录下
	（2）上传云函数
    貌似要逐个上传

## 2、修改群号、说明会腾讯会议号

index/indexs.js
        qqGroupNo: '207180839',
        year: 2025,
        wemeetingTime: '待定',
        wemeetingID: '待定',

## 3、修改总学分、课程列表

course/show.js
        data.totalCredit: 46


