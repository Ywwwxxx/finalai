-- Roblox Lua
local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")

local API_LATEST = "https://your-render-app.onrender.com/latest"

-- UI örneği: StarterGui içinde bir TextLabel olduğunu varsayalım
local Players = game:GetService("Players")
local function getTextLabel()
    local player = Players.LocalPlayer
    if not player then return nil end
    local gui = player:WaitForChild("PlayerGui")
    local screenGui = gui:FindFirstChild("StatusGui") or Instance.new("ScreenGui", gui)
    screenGui.Name = "StatusGui"
    local label = screenGui:FindFirstChild("StatusLabel")
    if not label then
        label = Instance.new("TextLabel")
        label.Name = "StatusLabel"
        label.Size = UDim2.new(0, 300, 0, 50)
        label.Position = UDim2.new(0, 20, 0, 20)
        label.BackgroundColor3 = Color3.fromRGB(20, 20, 20)
        label.TextColor3 = Color3.new(1,1,1)
        label.Parent = screenGui
    end
    return label
end

local label = nil
if Players.LocalPlayer then
    label = getTextLabel()
end

local function updateUI(result)
    if label and result then
        local topLabel = result.topLabel or "?"
        local topProb = result.topProb and math.floor(result.topProb * 100) or 0
        label.Text = string.format("Tahmin: %s (%d%%)", topLabel, topProb)
    end
end

-- Polling döngüsü: 200–500 ms arası
local lastUpdate = 0
local interval = 0.3

RunService.RenderStepped:Connect(function()
    if tick() - lastUpdate < interval then return end
    lastUpdate = tick()

    -- HttpService Roblox’ta senkron değil; pcall ile hataları yutalım
    local ok, resp = pcall(function()
        return HttpService:GetAsync(API_LATEST, false)
    end)

    if ok and resp then
        local parsed = nil
        local jOk, jVal = pcall(function()
            return HttpService:JSONDecode(resp)
        end)
        if jOk then
            parsed = jVal
            updateUI(parsed)

            -- Oyun mantığına bağla:
            -- örnek: belirli sınıfta hız artışı
            if parsed.topLabel == "ClassA" then
                -- burada karakter hızını, efektleri vb. tetikle
            elseif parsed.topLabel == "ClassB" then
                -- başka bir davranış
            end
        end
    end
end)