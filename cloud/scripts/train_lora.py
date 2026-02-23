import os
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
    pipeline,
    logging,
)
from peft import LoraConfig, PeftModel, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer

# 1. Configuration for LoRA
MODEL_NAME = "google/medgemma-4b-it"
DATASET_NAME = "BIROMU/maternal-health-clinical-notes" # Example clinical dataset
OUTPUT_DIR = "./medgemma-lora-adapter"

# LoRA Hyperparameters
LORA_R = 64
LORA_ALPHA = 16
LORA_DROPOUT = 0.1

def train_lora_medgemma():
    print(f"--- Starting LoRA Fine-tuning for {MODEL_NAME} ---")

    # Quantization Config (to fit on single GPU)
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True,
    )

    # Load Model & Tokenizer
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True
    )
    model.config.use_cache = False
    model = prepare_model_for_kbit_training(model)

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token

    # LoRA Configuration
    peft_config = LoraConfig(
        lora_alpha=LORA_ALPHA,
        lora_dropout=LORA_DROPOUT,
        r=LORA_R,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
    )

    model = get_peft_model(model, peft_config)

    # Load Dataset
    dataset = load_dataset(DATASET_NAME, split="train")

    # Training Arguments
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=3,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=2,
        optim="paged_adamw_32bit",
        save_steps=25,
        logging_steps=10,
        learning_rate=2e-4,
        weight_decay=0.001,
        fp16=True,
        bf16=False,
        max_grad_norm=0.3,
        max_steps=-1,
        warmup_ratio=0.03,
        group_by_length=True,
        lr_scheduler_type="constant",
        report_to="none"
    )

    # SFT Trainer
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        peft_config=peft_config,
        dataset_text_field="text", # Adjust based on dataset schema
        max_seq_length=1024,
        tokenizer=tokenizer,
        args=training_args,
        packing=False,
    )

    print("Starting trainer.train()...")
    trainer.train()
    
    # Save the adapter
    trainer.model.save_pretrained(OUTPUT_DIR)
    print(f"✅ LoRA Adapter saved to {OUTPUT_DIR}")

if __name__ == "__main__":
    train_lora_medgemma()
