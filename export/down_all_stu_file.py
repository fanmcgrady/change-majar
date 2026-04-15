import xlrd
import re
import requests
import os

# 获取此py文件路径，在此路径中保存文件
folder = os.getcwd()
print(folder)
'''
创建文件夹
'''


def mkdir(path):
    folder = os.path.exists(path)

    if not folder:  # 判断是否存在文件夹如果不存在则创建为文件夹
        os.makedirs(path)  # makedirs 创建文件时如果路径不存在会创建这个路径


def download(list):
    # 通过正则匹配
    pic_url = list[1:]  # 去除掉tempurl
    for key in pic_url:
        print("开始下载：" + key + "\r\n")
        try:
            pic = requests.get(key, timeout=5)
        except requests.exceptions.ConnectionError:
            print('下载失败')
            continue
        # 保存图片路径
        dir = key.split('/')[3]  # 学号+姓名 命名文件夹
        mkdir(folder + '/' + dir)  # 创建文件夹
        dir1 = key.split('/')[4]  # 内容 命名文件
        dir = folder + '/' + dir + '/' + dir1  # 下载文件的保存路径
        fp = open(dir, 'wb')
        fp.write(pic.content)
        fp.close()


def main(file):
    book = xlrd.open_workbook(file)
    sheet1 = book.sheets()[0]
    col1_values = sheet1.col_values(0)
    download(col1_values)


if __name__ == '__main__':
    files = os.listdir('.')
    for f in files:
        if f.endswith('.xls'):
            print(f)
            main(f)

