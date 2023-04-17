import os 
from flask import Flask, Response, abort, render_template, redirect, jsonify, request, send_file

# 创建flask实例  注意为两个英文下划线 左右都是
app = Flask(__name__, template_folder = '.',static_folder='static',static_url_path='')
# template_folder = '.'表示在同一级目录中搜索渲染模板文件中寻找模板文件
# static 必须指定，否则会无法加载css js等静态文件
# static_folder='',     # 空 表示为当前目录 (myproject/A/) 开通虚拟资源入口
# static_url_path='',

# 自定义setting.py中的BasedConfig类，用于传入项目开发阶段的路径、状态等，最重要的：DEBUG = True / False 。
# app.config.from_object('setting.DevelopmentConfig')

@app.route('/')
def index():
	return render_template("templates/index.html")

@app.route("/playlist")
def get_playlist():
    data = [{}]
    return jsonify(data)

@app.route("/wavs")
def get_wav():
    singer = request.args.get("singer")
    song = request.args.get("song")
    mode = request.args.get("mode")
    wavs = "static/wavs/我多想说再见啊.wav"
    return send_file(wavs)

@app.route("/lyrics")
def get_lyric():
    singer = request.args.get("singer")
    song = request.args.get("song")
    mode = request.args.get("mode")
    lyric_dir = "static/lyrics/我多想说再见啊.txt"
    with open(lyric_dir, 'r', encoding='utf-8') as f:
        lyric = f.read()
        print(lyric)
    return Response(lyric, mimetype="text/plain")

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8072, debug=True)
