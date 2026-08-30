# 欧拉恒等式：五个数的聚会

> 这是一篇示例文章，演示博客的写作方式（多行公式、折叠解答、AoPS 标签等）。看完后可以删除：`posts/2026-08-30-euler-identity.md`，并更新 `posts/index.json`。

欧拉恒等式把数学里五个最著名的常数聚在一起：

$$
e^{i\pi} + 1 = 0
$$

其中 $e$ 是自然对数的底，$i$ 是虚数单位，$\pi$ 是圆周率。它们的相遇来自指数函数的幂级数展开。对任意实数 $x$，

$$
e^{ix} = \cos x + i\sin x
$$

代入 $x = \pi$，便得到 $\cos\pi = -1$ 与 $\sin\pi = 0$。

## 多行推导（align* 环境）

用 `align*` 对齐每一步——注意要用工具栏的 `env` 按钮，或手写时把环境包在 `$$…$$` 里：

$$
\begin{align*}
e^{i\pi} &= \cos\pi + i\sin\pi \\
         &= -1 + i \cdot 0 \\
         &= -1
\end{align*}
$$

两个方向同时写，还能得到欧拉公式的共轭对（cases 环境）：

$$
\begin{cases}
e^{ix} = \cos x + i\sin x \\
e^{-ix} = \cos x - i\sin x
\end{cases}
$$

把它们相加相减，就推出：

$$
\cos x = \frac{e^{ix} + e^{-ix}}{2}, \qquad
\sin x = \frac{e^{ix} - e^{-ix}}{2i}
$$

## 隐藏解答（点击展开）

网页原生的折叠块，等价于 AoPS 论坛的 `\hide`——点击「解答」才展开：

<details>
<summary>点击查看解答：证明 $e^{i\pi} = -1$</summary>

由幂级数定义：

$$
e^{z} = \sum_{n=0}^{\infty} \frac{z^n}{n!}
$$

代入 $z = ix$，实部与虚部分别收敛到 $\cos x$ 与 $\sin x$。取 $x = \pi$：

- $\cos\pi = -1$
- $\sin\pi = 0$

于是 $e^{i\pi} = -1$，即 $e^{i\pi} + 1 = 0$。□

</details>

> 提示：`<summary>` 与内容之间、内容与 `</details>` 之间各留一个空行，内部的 Markdown 与公式才会正常解析。

## 定理环境

用 `:::定理类型 标题` 包裹，自动渲染成带编号的卡片（定理 1、引理 1……各类型独立计数）：

:::theorem 欧拉公式
对任意实数 $x$，有

$$
e^{ix} = \cos x + i\sin x
$$
:::

:::proof
由指数函数的幂级数定义

$$
e^{z} = \sum_{n=0}^{\infty} \frac{z^n}{n!}
$$

代入 $z = ix$ 后分离实部与虚部即得。证明末尾的 ∎ 由样式自动添加。
:::

:::remark
取 $x = \pi$，便回到五个数的聚会。
:::

## 一点注记

- 也有人把它写成 $e^{i\pi} = -1$，这省略了 $0$ 与 $1$。
- 恒等式在复分析中几乎是平凡的，却常被当作「数学之美」的象征。
- 若用 Taylor 级数直接展开 $e^{i\theta}$，也可以得到同样的结论：

```python
import cmath
# e^(i*pi) 在浮点意义下约等于 -1
print(cmath.exp(1j * cmath.pi))   # (-1+1.2246467991473532e-16j)
```

> 形式如 $x_i$、$a_{ij}$ 的下标同样可以直接书写，KaTeX 会自动排版。

## AoPS 风格

也支持 AoPS 论坛式的标签：行内公式 [math]a^2 + b^2 = c^2[/math]，块级公式

[math]
\det
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix} = ad - bc
[/math]

---

欧拉在 1748 年的 *Introductio in analysin infinitorum* 中给出了这一公式。据说高斯曾说，如果一个人不能立刻看出这个式子的意义，他就永远成不了第一流的数学家。
