const Cart = require("../models/Cart")
const Product = require("../models/Product")
const mongoose = require("mongoose")
const User = require("../models/User")

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id

    let cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "product_name price images discount_price category subcategory stock",
      populate: [
        { path: "category", select: "category_name" },
        { path: "subcategory", select: "subcategory_name" },
      ],
    })

    if (!cart) {
      // Create empty cart if it doesn't exist
      cart = new Cart({
        userId,
        userName: req.user.name,
        items: [],
      })
      await cart.save()
    }

    // Filter out items where product doesn't exist anymore
    const validItems = cart.items.filter((item) => item.productId)

    if (validItems.length !== cart.items.length) {
      cart.items = validItems
      await cart.save()
    }

    console.log("Cart items being returned:", JSON.stringify(cart.items, null, 2))

    res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      cart: cart,
      items: cart.items,
      totalItems: cart.items.reduce((total, item) => total + item.quantity, 0),
    })
  } catch (err) {
    console.error("Get cart error:", err)
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    })
  }
}

// Add item to cart
exports.addItemToCart = async (req, res) => {
  try {
    const { productId, size, color, quantity = 1 } = req.body
    const userId = req.user._id

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      })
    }

    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      })
    }

    // Find the product
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      })
    }

    // Get user info for cart
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Find cart or create if it doesn't exist
    let cart = await Cart.findOne({ userId })

    if (!cart) {
      cart = new Cart({
        userId,
        userName: user.name,
        items: [],
      })
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.size === size && item.color === color,
    )

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      const newQuantity = cart.items[existingItemIndex].quantity + Number.parseInt(quantity)

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more items. Only ${product.stock} available in stock`,
        })
      }

      cart.items[existingItemIndex].quantity = newQuantity
    } else {
      // Add new item if it doesn't exist
      cart.items.push({
        productId,
        size: size || "M",
        color: color || "Default",
        quantity: Number.parseInt(quantity),
      })
    }

    await cart.save()

    // Return the updated cart with populated products
    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "product_name price images discount_price category subcategory stock",
      populate: [
        { path: "category", select: "category_name" },
        { path: "subcategory", select: "subcategory_name" },
      ],
    })

    res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      cart: populatedCart,
      items: populatedCart.items,
      totalItems: populatedCart.items.reduce((total, item) => total + item.quantity, 0),
    })
  } catch (error) {
    console.error("Add to cart error:", error)
    res.status(500).json({
      success: false,
      message: "Error adding item to cart",
      error: error.message,
    })
  }
}

// Remove item from cart
exports.removeItemFromCart = async (req, res) => {
  try {
    const { productId, size, color } = req.body
    const userId = req.user._id

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      })
    }

    const cart = await Cart.findOne({ userId })

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      })
    }

    // Find the item index - match by productId, and optionally by size and color
    let itemIndex = -1
    if (size && color) {
      itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId && item.size === size && item.color === color,
      )
    } else {
      itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId)
    }

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      })
    }

    // Remove the item
    cart.items.splice(itemIndex, 1)
    await cart.save()

    // Return the updated cart with populated products
    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "product_name price images discount_price category subcategory stock",
      populate: [
        { path: "category", select: "category_name" },
        { path: "subcategory", select: "subcategory_name" },
      ],
    })

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      cart: populatedCart,
      items: populatedCart.items,
      totalItems: populatedCart.items.reduce((total, item) => total + item.quantity, 0),
    })
  } catch (error) {
    console.error("Remove from cart error:", error)
    res.status(500).json({
      success: false,
      message: "Error removing item from cart",
      error: error.message,
    })
  }
}

// Update item quantity
exports.updateItemQuantity = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body
    const userId = req.user._id

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      })
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      })
    }

    // Check if product exists and has enough stock
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      })
    }

    const cart = await Cart.findOne({ userId })

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      })
    }

    // Find the item - match by productId, and optionally by size and color
    let itemIndex = -1
    if (size && color) {
      itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId && item.size === size && item.color === color,
      )
    } else {
      itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId)
    }

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      })
    }

    // Update quantity
    cart.items[itemIndex].quantity = Number.parseInt(quantity)
    await cart.save()

    // Return the updated cart with populated products
    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "product_name price images discount_price category subcategory stock",
      populate: [
        { path: "category", select: "category_name" },
        { path: "subcategory", select: "subcategory_name" },
      ],
    })

    res.status(200).json({
      success: true,
      message: "Quantity updated successfully",
      cart: populatedCart,
      items: populatedCart.items,
      totalItems: populatedCart.items.reduce((total, item) => total + item.quantity, 0),
    })
  } catch (error) {
    console.error("Update quantity error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating cart",
      error: error.message,
    })
  }
}

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id

    const cart = await Cart.findOne({ userId })

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      })
    }

    cart.items = []
    await cart.save()

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart: cart,
      items: [],
      totalItems: 0,
    })
  } catch (error) {
    console.error("Clear cart error:", error)
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: error.message,
    })
  }
}
