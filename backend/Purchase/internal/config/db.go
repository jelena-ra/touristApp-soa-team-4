package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func ConnectPostgres() *sql.DB {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	if err := db.Ping(); err != nil {
		log.Fatal("Not able to connect to Postgre:", err)
	}
	fmt.Println("Succesfully connected to Postgre!")

	createTables(db)
	return db
}
func createTables(db *sql.DB) {
	queries := []string{

		`CREATE TABLE IF NOT EXISTS shopping_carts (
			id TEXT PRIMARY KEY,
			user_id TEXT UNIQUE NOT NULL,
			total DOUBLE PRECISION DEFAULT 0
		);`,

		`CREATE TABLE IF NOT EXISTS order_items (
			id TEXT PRIMARY KEY,
			tour_id TEXT NOT NULL,
			cart_id TEXT REFERENCES shopping_carts(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			price DOUBLE PRECISION NOT NULL
		);`,

		`CREATE TABLE IF NOT EXISTS tour_purchase_tokens (
			id serial PRIMARY KEY,
			user_id TEXT NOT NULL,
			tour_id TEXT NOT NULL,
			token TEXT NOT NULL
		);`,
	}

	for _, q := range queries {
		if _, err := db.Exec(q); err != nil {
			log.Fatalf("Error with creating table %v", err)
		}
	}
}
