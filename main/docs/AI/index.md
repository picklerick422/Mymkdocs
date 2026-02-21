---
comments: true
---

# **Chapter I：Neural Networks and Deep Learning**

**CNN**（Convolutional Neural Network）卷积神经网络 ----> 图像处理

>一维时间序列（两种英文说法one-dimensional time series / temporal sequence）

**RNN**（Recurrent Neural Network）递归神经网络 ----> 序列数据：语言、音频（一维时间

>结构化数据（基本数据库）：分类整理后~

>非结构数据：未筛选、处理的原始数据（人类天生擅长理解（语言等~

## **一、激活函数（Activation Function）**
!!! note "个人理解"
    旨在模拟人脑神经元作用。类似于神经元的动作电位，达到一定水平的刺激输入后，输出特定信息。
>激活函数（Activation Function）是一种添加到人工神经网络中的函数，旨在帮助网络学习数据中的复杂模式。在神经元中，输入的input经过一系列加权求和后作用于另一个函数，这个函数就是这里的激活函数。
>![model1.png](https://pic3.zhimg.com/80/v2-49871840b4d028357ecfc4f6c35998d6_1440w.webp){: .zoom}
>![model2.png](https://pic1.zhimg.com/80/v2-91e1b17ef9b61256739749feff3cea10_1440w.webp){: .zoom}
> ### 性质：

>+ **连续并可导**（允许少数点上不可导），可导的激活函数可以直接利用数值优化的方法来学习网络参数；

>+ 激活函数及其导数要尽可能**简单**一些，太复杂不利于提高网络计算率；

>+ 激活函数的导函数值域要在一个**合适的区间**内，不能太大也不能太小，否则会影响训练的效率和稳定性。

## **二、常见激活函数**
### **1. Sigmoid函数**（Logistic函数）
+ **函数表达：**<h4 style="text-align:center">$$ f(x)=\frac{1}{1+e^{-x}}  $$ </h4>

+ **取值范围：**<h3 style="text-align:center">(0,1)</h3>

+ **图像：**

![sigmoid-pic.png](https://pic2.zhimg.com/80/v2-707f1aa66391f2a838fd3b81c93d45d5_1440w.webp){: .zoom}

+ **适用类：**二分类，在特征相差比较复杂或是相差不是特别大时效果比较好。

    · Sigmoid 函数的输出范围是 0 到 1。由于输出值限定在 0 到1，因此它对每个神经元的输出进行了归一化；

    · 用于将预测概率作为输出的模型。由于概率的取值范围是 0 到 1，因此 Sigmoid 函数非常合适；

    · 梯度平滑，避免「跳跃」的输出值；

    · 函数是可微的。这意味着可以找到任意两个点的 sigmoid 曲线的斜率；

    · 明确的预测，即非常接近 1 或 0。


+ **不足：**

    · **梯度消失**：饱和神经元

    · **不以0为中心**：非零中心化的输出会使得其后一层的神经元的输入发生偏置偏移（Bias Shift），并进一步使得梯度下降的收敛速度变慢。

    · **计算成本高**

### **2. tanh函数**（双曲正切激活函数）
+ **函数表达：**<h4 style="text-align:center">$$ f(x)=\tanh (x)=\frac{e^{x}-e^{-x}}{e^{x}+e^{-x}}=\frac{2}{1+e^{-2x}}-1 $$</h4>

<h4 style="text-align:center">$$ tanh(x)=2sigmoid(2x)-1 $$ </h4>

+ **取值范围：**<h3 style="text-align:center">(-1,1)</h3>

+ **图像：**

![tanh.pic](https://pic1.zhimg.com/80/v2-2e4c92ede47e719d0ce54653b2f443d8_1440w.webp)

+ **不足：**

    · **梯度消失**：类似于sigmoid函数，当输入较大或较小时，输出几乎是平滑的并且梯度较小，这不利于权重更新。

>**注意：**在一般的二元分类问题中，tanh 函数用于隐藏层，而 sigmoid 函数用于输出层，但这并不是固定的，需要根据特定问题进行调整。

### **3. ReLU激活函数**（修正线性单元（Rectified Linear Unit））

+ **函数表达：**<h4 style="text-align:center">

\begin{aligned} f(x) &=\left\{\begin{array}{ll} 
x & , x>=0 \\ 0 & , x<0 
\end{array}\right.\\ &=\max (0, x) \end{aligned} 

+ **图像：**

![ReLU.pic](https://pic3.zhimg.com/80/v2-8505da32b28e52b61772f04fbcc3c9a2_1440w.webp)

</h4>

+ **优点：**

    · 当输入为正时，**导数为1**，一定程度上**改善了梯度消失问题**，加速梯度下降的收敛速度；

    · 计算速度**快**得多。ReLU 函数中只存在线性关系

    · **生物学合理性（Biological Plausibility）**,比如单侧抑制、宽兴奋边界（即兴奋程度可以非常高）

+ **不足：**

    · **Dead ReLU 问题**。当输入为负时，ReLU 完全失效。有些区域很敏感，有些则不敏感。但是在反向传播过程中，如果输入负数，则梯度将完全为零；

    >**【Dead ReLU问题】**ReLU神经元在训练时比较容易“死亡”。在训练时，如果参数在一次不恰当的更新后，第一个隐藏层中的某个ReLU 神经元在所有的训练数据上都不能被激活，那么这个神经元自身参数的梯度永远都会是0，在以后的训练过程中永远不能被激活。这种现象称为死亡ReLU问题，并且也有可能会发生在其他隐藏层。

### **4. Leaky ReLU函数**

+ **函数表达：**<h4 style="text-align:center">

\begin{aligned} \text { LeakyReLU }(x) &=\left\{\begin{array}{ll} x & \text { if } x>0 \\ \gamma x & \text { if } x \leq 0 \end{array}\right.\\ &=\max (0, x)+\gamma \min (0, x), \end{aligned}

</h4>

<p style="text-align:center">$$ \gamma是个很小的数，下图以\gamma=0.1为例 $$</p>

+ **图像：**

![Leaky ReLU.pic](https://pic3.zhimg.com/80/v2-a942719eba0ee2d65db0a8a030d280ba_1440w.webp)

+ **优点**

    · 缓解Dead ReLU问题

    · 扩大函数范围

### **5. Parametric ReLU函数**

### **6. ELU函数**

### **7. SeLU函数**

### **8. Softmax函数**

……

## **三、Referance**
+ [深度学习笔记：如何理解激活函数？（附常用激活函数）](https://zhuanlan.zhihu.com/p/364620596)
+ [ai-start网站Chapter I](http://www.ai-start.com/dl2017/)