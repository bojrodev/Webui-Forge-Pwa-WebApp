# Resolver: Native Android Client for WebUI Forge & ComfyUI

![Platform](https://img.shields.io/badge/Platform-Android%2010+-green.svg)
![Backend](https://img.shields.io/badge/Backend-Forge%20Neo-blue)
![License](https://img.shields.io/badge/License-GPLv3-red.svg)

**Resolver** is a high-performance, native Android interface for AI image generation. It is built using a **Hybrid Architecture** (Capacitor 6.0 + Vanilla JS) and utilizes **Native Android Foreground Services** to ensure generation queues remain active in the background or while the screen is off.

---

## ⚡ Screenshots

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/51de1657-b0d9-42f9-b661-8b12cf00b8b2" width="200" /><br />
      <b>Home / SDXL TAB</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/eeaf30ac-7b93-4791-b82f-2e67159e0350" width="200" /><br />
      <b>Flux UI</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/659ff2d9-f8e1-42a8-a73a-01b9273ab574" width="200" /><br />
      <b>QWEN / Z-IMAGE TAB</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/39b24f96-6363-43b0-8d40-2bff331b84b3" width="200" /><br />
      <b>Inpainting</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/fa8f194d-8bce-4b36-b462-61066007e8b7" width="200" /><br />
      <b>Lora Tab</b>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/f6770c4f-4f05-4a94-b5c2-062945531797" width="200" /><br />
      <b>Configuration Tab</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/af49aabc-eb80-4b5b-845a-7c7f3b7483f8" width="200" /><br />
      <b>Magic Prompt Tab</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/4575b557-e086-4238-a1df-ae154bd239f7" width="200" /><br />
      <b>Gallery Tab</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/8475ea5d-28da-42e2-8bb4-04277bbd3cb9" width="200" /><br />
      <b>Metadata viewer Tab</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/19ee57c1-d1f4-46e6-b2fc-a1c58e17fe63" width="200" /><br />
      <b>Queue Tab</b>
    </td>
  </tr>
</table>

---

## ⚡ Key Features

### Forge WebUI Core
* **Primary Integration:** Resolver is natively optimized for [WebUI Forge Neo (Haoming02)](https://github.com/Haoming02/sd-webui-forge-classic/tree/neo) and the original [lllyasviel Forge WebUI](https://github.com/lllyasviel/stable-diffusion-webui-forge).
* **Native API Communication:** Utilizes direct API endpoints for rapid state synchronization and command execution.
* **Smart Connection Mode:** Toggle between **Local Mode** (automatic port appending) and **External Mode** (enforced HTTPS for Ngrok/Cloudflare).
* **Remote Power Control:** Integrated "Bojro Dev Power" for Wake-on-LAN and a remote **KILL!** signal to stop the backend server instantly.

### ComfyUI Engine
* **Workflow Orchestration:** Execute API-compatible ComfyUI `.json` workflows directly within the app.
* **Dynamic UI Generation:** Automatically parses workflow graphs to generate native sliders, dropdowns, and text inputs for samplers, checkpoints, and prompts.
* **Live WebSocket Feedback:** Real-time step monitoring and binary image previews via persistent socket connections.
* **Unified Gallery:** Automatically archives ComfyUI outputs into the main history for cross-engine metadata analysis.

### Flux First Block Cache (FBC)(Only lllyasviel Forge WebUI)
* **Performance Boost:** Native support for the Forge Block Cache extension to reduce generation times.
* **Optimization:** Skips redundant diffusion steps for `bnb-nf4` and `fp8` Flux models.
* **Direct Control:** Threshold and skip step adjustments accessible directly via the Flux UI.

### Native Hi-Res Fix
* **Upscaling Engine:** Full support for `Hires. fix` across SDXL, Flux, and Qwen modes.
* **Customization:** Adjustable upscalers (ESRGAN, etc.), denoising strength, and upscale factors.

### True Background Generation
* **Foreground Service:** Java-based service with Wake Locks to maintain active WebSocket connections during long Flux GGUF tasks or batch queues.
* **Persistence:** Robust management for Ongoing, Next, and Completed jobs.

### Advanced Generation Engines
* **Flux GGUF:** Support for VAE, CLIP, and T5-XXL selectors with specific quantization bit settings.
* **Qwen / Z-Image Turbo:** Specialized mode for Qwen models with dense narrative support.
* **SDXL Powerhouse:** Comprehensive control over sampling, scheduling, and aspect ratio locking.
* **Mobile Inpainting:** Touch-optimized canvas editor with mask blurring and denoising controls.

### Magic Prompt (Local LLM)
* **Smart Expansion:** Connects to local LLM servers (LM Studio, Ollama) to translate simple ideas into complex prompts.
* **Mode Awareness:** Automatically switches system instructions based on the active engine (SDXL, Flux, or Qwen).

---

## ⚡ Backend Setup (Mandatory)

**WebUI Forge:**
In `webui-user.bat`, set:
`set COMMANDLINE_ARGS=--listen --api --cors-allow-origins *`

**ComfyUI:**
Append these flags to your launch command:
`--listen --enable-cors-header *`

---

## ⚡ Magic Prompt (LLM) Setup

Host a **Bojro PromptMaster** model on your PC:
1.  **Download:** [PromptMaster v2 (Uncensored)](https://huggingface.co/bojrodev/BojroPromptMaster_uncensored_v2-8B) or [v1](https://huggingface.co/bojrodev/BojroPromptMaster-v1-8B).
2.  **Server:** Load into **LM Studio** or **Ollama** on your local network.
3.  **Connect:** Open the Bot modal in Resolver, enter the server URL, and save.

---

## ⚡ Remote PC Wake

Requires `BojroPowerv_x_portable.exe` on the host PC.
1.  **Run Helper:** Execute the utility on your PC.
2.  **Configure:** Set the **Wake Port** (Default: `5000`) in the **CFG Tab**.
3.  **Operation:** Use the Power Button (ტ) to start or the **KILL!** button to halt services.

---

## ⚡ Installation & Building

### Installation
1.  Install **WebUI Forge** and/or **ComfyUI** on your PC.
2.  Download the latest `.apk` from the **Releases**.
3.  Ensure phone and PC are on the same Wi-Fi.
4.  Set PC IP in the **CFG Tab** and save.

### Building from Source
```bash
git clone [https://github.com/bojrodev/Resolver-WebUI-Forge-Client.git](https://github.com/bojrodev/Resolver-WebUI-Forge-Client.git)
npm install
npx cap sync
npx cap open android
