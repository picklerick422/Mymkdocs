# **Chapter II：神经网络的编程基础(Basics of Neural Network programming)**

## **2.1 二分类**（Binary Classification）

+ 前向暂停(**forward pause**) or 向前传播(**forward propagation**)

+ 反向暂停(**backward pause**) or 反向传播(**backward propagation**)

+ 逻辑回归(**logistic regression**) ---> 应用于二分类问题的算法

+ ### 【例】. 二分类问题的example
> [![cat1](https://7up.pics/images/2024/08/04/cat1.png)](https://7up.pics/image/AHQYWp)

!!! note
    一张图片包含axb个像素点，每个像素点包含了红绿蓝三原色的强度值。将他们全都放在同一个列矩阵当中，构成(n=)3ab行1列矩阵，作为一个输入值。
    
    在二分类问题中，我们的目标就是训练出一个分类机，它以图片的特征向量作为输入，然后预测输出结果y为1还是0，也就是预测图片中是否有猫：

    [![cat2](https://7up.pics/images/2024/08/04/cat2.png)](https://7up.pics/image/AHQCR9)

### **符号定义：**

$x$：表示一个 $n_{x}$ 维数据，为输入数据，维度为 $(n_{x} ,1)$;

$y$：表示输出结果，取值为 $(0,1)$

$(x^{(i)},y^{(i)})$:表示第组 $i$ 数据，可能是训练数据，也可能是测试数据，此处默认为训练数据； 

$X$ = $[x^{(1)},x^{(2)},...,x^{(m)}]$：表示所有的训练数据集的输入值，放在一个 $n_{x}$ x $m$ 的矩阵中，其中$m$表示样本数目; 

$Y$ = $[y^{(1)},y^{(2)},...,y^{(m)}]$：对应表示所有训练数据集的输出值，维度为 $1$ x $m$。

一对(x,y)表示一个单独的样本，$X$为训练集，有时写做 $M_{train}$

[![notation](https://7up.pics/images/2024/08/04/notation.png)](https://7up.pics/image/AHQ4gf)

## **2.2 逻辑回归** (Logistic Regression)

**Hypothesis Function**（假设函数）：

$$ \hat{y}=\omega^{T} \hat{x}+b \qquad or \qquad \hat{y}=\sigma (\theta ^{T}x)$$  

$X$：输入的特征向量

$\hat{y}$：对于实际值y的估计

$\omega、b$：参数

$\theta ^{T}$：参数集合，包含$b$以及多个 $\omega$

[![function](https://7up.pics/images/2024/08/04/function.png)](https://7up.pics/image/AHQDBM)
[![theta](https://7up.pics/images/2024/08/04/theta.png)](https://7up.pics/image/AHQNCZ)

## **2.3 逻辑回归的代价函数**（Logistic Regression Cost Function）

+ **代价函数目的**：为了训练出逻辑回归模型的$\omega$和$b$参数，需要通过训练**代价函数**来得到参数

$\hat{y}^{(i)}=\sigma (\omega^{T}x^{(i)}+b), \  where \  \sigma (z)=\tfrac{1}{1+e^{-z}}$

为了让模型通过学习调整参数，你需要给予一个$m$样本的训练集，这会让你在训练集上找到参数 $\omega$和参数$b$,来得到你的输出。

+ **损失函数**(误差函数)：**Loss function**: $L(\hat{y},y)$ <u>用以预测输出值与实际值有多接近。</u>
平时我们用方差来评估误差，而在逻辑回归中的优化目标不是凸优化，只能找到多个局部最优值。

    !!! note "凸优化"
        **凸优化（convex optimization）**就是：1、在最小化（最大化）的要求下     
        2、目标函数是一个凸函数（凹函数）  
        3、同时约束条件所形成的可行域集合是一个凸集。

        **1.凸集**：集合C中任意2个元素连线上的点也在集合C中，则C为凸集。*（类似于线性空间）*

        **2.凸函数**

    我们使用：$L(\hat{y},y)=-ylog(\hat{y})-(1-y)log(1-\hat{y})$

    + $y=1$时损失函数 $L=-log(\hat{y})$，此时$y$越大，损失越小

    + $y=0$时损失函数 $L=-log(1-\hat{y})$，此时$y$越小，损失越小

    为衡量算法在全部训练样本上的表现如何，我们需要定义一个**算法的代价函数**：对$m$个样本的损失函数求和再除以$m$：
    $$ J(\omega,b)=\tfrac{1}{m}\sum_{i=1}^{m}L(\hat{y}^{(i)},y^{(i)})=\tfrac{1}{m}\sum_{i=1}^{m}(-\hat{y}^{(i)}-(1-\hat{y}^{(i)})log(1-\hat{y}^{(i)}))$$

!!! question
    那么，具体来讲，为什么损失函数会是这样的形式呢？

    请见**【附】2.9logistic 损失函数的解释**（Explanation of logistic regression cost function）

## **2.4 梯度下降法**（Gradient Descent）

<big><mark>在你测试集上，通过最小化代价函数（成本函数）$J(\omega,b)$ 来训练的参数 $\omega、b$ 。即找到最低点对应的 $\omega、b$</mark></big>（见下图）

[![gradient](https://7up.pics/images/2024/08/04/gradient.jpg)](https://7up.pics/image/AHQKVz)
但可能会出现很多不同的局部最小值。由于代价函数 $J(\omega,b)$ 的特性，必须定义其为凸函数

+ **步骤**
    + **1.初始化**：初始化 $\omega、b$（可随机
    + **2.迭代**：朝最陡的下坡方向走一步，不断地迭代，直到找到全局最优解

以一元（$\omega$）时：

$$Repeat\left\{\omega:=\omega-\alpha \tfrac{dJ(\omega)}{d\omega}\right\}$$

二元($\omega、b$)

$$
 \begin{Bmatrix}
 \omega:=\omega-\alpha \tfrac{\partial J(\omega)}{\partial\omega}\\\omega:=b-\alpha \tfrac{\partial J(\omega)}{\partial b}
\end{Bmatrix}
$$

"$:=$" 表示更新参数

"$\alpha$" 表示学习率（**learning rate**）,用以控制步长（**step**）

[![slope](https://7up.pics/images/2024/08/04/slope.jpg)](https://7up.pics/image/AHQhx4)

## **【附】2.5 计算图**（Computation Graph）

## **2.6 逻辑回归中的梯度下降**（Logistic Regression Gradient Descent）##

再次明确我们的目标：通过损失函数$J(\omega,b)$ 得到的参数 $\omega、b$ 来找到最合适的逻辑回归模型。

代码示例：（结合代码梳理思路）

```py linenums='1'
J=0;dw1=0;dw2=0;db=0;  #初始化initialize
for i = 1 to m
    z(i) = wx(i)+b;
    a(i) = sigmoid(z(i));  #激活函数
    J += -[y(i)log(a(i))+(1-y(i)）log(1-a(i));  #损失函数
    dz(i) = a(i)-y(i);  #dJ/dz
    dw1 += x1(i)dz(i);  #加起来是为了球代价函数的dw
    dw2 += x2(i)dz(i);  
    db += dz(i);  
J/= m;  #代价函数
dw1/= m;
dw2/= m;
db/= m;
w=w-alpha*dw
b=b-alpha*db
```

!!! note
    这样的编码方式存在的问题是需要两重for循环，运行效率低，所以需要进行**《向量化》**，从而显著地加速运算。

## **2.7 向量化**（Vectorization）##

`z=np.dot(w,x)+b`

```py linenums='1'
import numpy as np  #导入numpy库

a = np.array([1,2,3,4])  #创建一个数据a
print(a)
# [1 2 3 4]

import time #导入时间库
a = np.random.rand(1000000)
b = np.random.rand(1000000)  #通过round随机得到两个一百万维度的数组
tic = time.time()  #现在测量一下当前时间

#向量化的版本
c = np.dot(a,b)
toc = time.time()
print(“Vectorized version:” + str(1000*(toc-tic)) +”ms”)  #打印一下向量化的版本的时间
​
#继续增加非向量化的版本
c = 0
tic = time.time()
for i in range(1000000):
    c += a[i]*b[i]
toc = time.time()
print(c)
print(“For loop:” + str(1000*(toc-tic)) + “ms”)#打印for循环的版本的时间

# 250286.989866
#Vectorized version:1.5027523040771484ms
#250286.989866
#For loop:474.29513931274414ms
```

显著的性能提升源自于numpy调用了**GPU**进行了**并行的计算**，（并行化指令：**SIMD指令**）_GPU更加擅长SIMD计算_

!!! note
    <u>CPU与GPU之间的差距</u>就像是：一个精通高等数学的<big>大学生</big> 和 一万名熟练掌握竖式计算的<sub>小学生</sub>。如果让他们比赛进行一万道乘法计算，虽然小学生和大学生1v1可能算的较慢，虽然大学生可以轻松解出偏微分方程，但是，这一万道乘法计算被平均分给了一万名小学生，那他们就可以在一分钟内做完这所有的题目！

### **向量化 logistic 回归的梯度输出**（Vectorizing Logistic Regression's Gradient）

将多组数据横向排列成矩阵，以同时完成多组数据的处理

$$Z=\omega^{T}X+b=np.dot(\omega.T,X)+b $$

$$A=\sigma(Z)$$

$$dZ=A-Y$$

$$d\omega=\frac{1}{m}*X*dz^{T}$$

$$db=\frac{1}{m}*np.sum(dZ)$$

$$\omega:=\omega-\alpha*d\omega$$

$$b:=b-\alpha*db$$

## **【附】2.8 Python 中的广播**（Broadcasting in Python）

!!! note
    如果一个Pytorch运算支持广播的话，那么就意味着传给这个运算的参数会被自动扩张成相同的size，在不复制数据的情况下就能行。

    广播机制实际上就是在运算过程中，去处理两个形状不同向量的一种手段。

    Numpy通过广播机制，可以让循环在C中而不是Python中进行。整个过程可以做到避免无用的复制，达到更高效的运算。

    ![695618c70fd2922182dc89dca8eb83cc](https://7up.pics/images/2024/08/07/695618c70fd2922182dc89dca8eb83cc.png)

## **【附】2.9 logistic 损失函数的解释**（Explanation of logistic regression cost function）

$\hat{y}=\sigma (z)=\sigma (\omega^{T}x+b)=\tfrac{1}{1+e^{-z}}$
&emsp; $\hat{y}$ 是给定训练样本$x$条件下$y$等于1的概率

$If &emsp; &ensp; y=1: \  p(y|x)=\hat{y}$

$If &emsp; &ensp; y=0: \  p(y|x)=1-\hat{y}$

<font size="5">====>> &emsp; &ensp; &emsp; &ensp; <mark>$p(y|x)=\hat{y}^{y}(1-\hat{y})^{1-y}$</mark></font>

!!! abstract
    对上式求导，$log(p(y|x))$最大化等价于最大化$p(y|x)$
    从而得到：$$ ylog\hat{y}+(1-y)log(1-\hat{y}) ,即损失函数的负数(-L(\hat{y},y))$$

    前面有一个负号的原因是当你训练学习算法时需要算法输出值的概率是最大的（以最大的概率预测这个值），然而在逻辑回归中我们需要最小化损失函数，因此最小化损失函数与最大化条件概率的对数$log(p(y|x))$关联起来了，因此这就是单个训练样本的损失函数表达式。




## **Referance**
+ [深度学习笔记：第二周：神经网络的编程基础(Basics of Neural Network programming)](http://www.ai-start.com/dl2017/html/lesson1-week2.html)