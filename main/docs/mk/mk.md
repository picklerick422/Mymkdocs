# **mkdocs 使用记录**
!!! Abstract 
    初次尝试使用。看过我校很多的大佬都做了类似的笔记分享网站，正好我也有做笔记的习惯，是故趁此假期做以尝试。

##**1 安装**

mkdocs 是 python 的一个包，直接 ` >>pip install mkdocs` 就可以了
!!! tips
    上述该指令以及以下与pip相关的各类下载操作，如遇到因为下载过慢而出现的error，如 ![13713fc52c1fe67e4.png](https://7up.pics/images/2024/01/28/13713fc52c1fe67e4.png){: .zoom}
    
    ·错误原因：连不上pip的源，下载依赖包失败

    ·解决方法：` >> pip install -i https://pypi.tuna.tsinghua.edu.cn/simple/`

    使用了如是后缀，即可从国内镜像网站获取软件包QAQ！（上述例子使用清华镜像源安装软件包）

查看mkdocs是否安装成功，只需要运行命令：
` >> mkdocs --version`

##**2 使用**
```
>> mkdocs new test    // 创建一个名为 test 的文件夹,存储代码
>> cd test
```
此时，就在所属文件夹内创建了如下的目录结构：
```
test/
 ├── docs/            // 存放markdown文档
 │     └── index.md   // 主（首）页
 └── mkdocs.yml       // 配置文件
```
打开实时渲染服务（默认端口 8000）
```
>> mkdocs serve
```
浏览器中输入 127.0.0.1:8000 预览。终端键入 ++ctrl+c++ 关闭服务器

` >> mkdocs build        //生成静态网页代码`

这个命令会在` test`目录下生成一个目录` site/`，这个目录中包含了静态站点的页面内容。这时就可以将里面的内容部署到网站上了

接下来，我们可以在GitHub中创建一个仓库，名为` mymkdocs`。

然后在` test`下打开git，并将当前目录设置为一个仓库，然后与GitHub新创建的仓库` mymkdocs`连接：

```py linenums="1"
>> git init
>> git remote add origin https://github.com/yourusername/mymkdocs.git
>> mkdocs gh-deploy
```
!!! tip
    多次上传之后，如果出现问题，形如：

    ```py linenums="1"
    hint: Updates were rejected because the remote contains work that you do not
    hint: have locally. This is usually caused by another repository pushing to
    hint: the same ref. If you want to integrate the remote changes, use
    hint: 'git pull' before pushing again.
    hint: See the 'Note about fast-forwards' in 'git push --help' for details.
    ```
    不要慌张，只是本地数据库和remote数据冲突了而已，只需要同步一下：
    ` >> git pull origin gh-pages` 即可

自动根据 mkdocs.yml 中设置的项目地址部署到 GitHub 的 gh-pages 分支中

##**3 配置文件**
+ site_name：必填，文档主标题名称
+ site_url：最终的网站 url(可以使用自定义域名)
+ repo_url：对应的 GitHub repo 的链接，用于 deploy 和右上角的链接
+ edit_url：相对于 repo 链接的 docs 目录地址
+ site_description 站点描述
+ copyright：左下角版权信息
+ theme: 主题样式例如 :

!!! tip
    还有一件事（老爹音），不知道大家有没有可能出现这样的问题，就是自定义域名过期之后，即便把它的文件删掉，浏览器也会自动跳转到你原先自定义的域名……（我在这个问题上卡了好一会TAT）这是其实是因为浏览器的dns记忆，清一下缓存就好了QAQ

``` py linenums="1" hl_lines="3"
theme: 
  name: 'material'     // 使用material主题,需要pip安   装mkdocs-material
  custom_dir: pathname // 用于覆盖模板（切记：该行一定要放在'name:'的下一行）
  language: 'zh'       // 使用中文
  icon:
    logo: ...          // 左上角的 logo 
  feature: 
    ...
  font:                // 字体
    text: ...
    code: ...
  palette:
    ...                // 配色方案
```

!!! warning
    注意细节，高亮部分暴毙让我崩溃了好一段时间（1.5h）QAQ 一定要放在第二行，可能大概是因为custom_dir(目标目录)是你要用来覆盖原主题的目录，所以要写在主题名的下面，不然会冲突，运行不了，或者加载不出来一些你要用的扩展（比如评论系统）。

+ markdown_extensions：需要添加的 pymarkdown 扩展（包已经随 mkdocs 默认安装），具体各种扩展的用法看官方文档
+ extra：主题需要的其他配置，比如 material 主题的右下角链接 social 和流量分析 analytics 的设置
+ extra_css：附加的 css 文件，可以是 url 也可以是相对于 docs 的相对路径
+ extra_javascript：附加的 js 文件，可以是 url 也可以是相对于 docs 的相对路径。会放到 body 的最后，如果需要放到 head 里需要用覆盖模板的方式
+ plugins：一些插件，比如搜索 search，显示最近修改时间 git-revision-date-localized
+ nav：目录结构

##**4 评论系统**
浙里用的是比较常用的giscus扩展插件……

>####本站的配置文件
>还没有制作好QAQ
